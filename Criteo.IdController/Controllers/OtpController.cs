using System;
using System.Linq;
using Criteo.IdController.Helpers;
using Microsoft.AspNetCore.Mvc;
using Metrics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using static Criteo.Glup.IdController.Types;

namespace Criteo.IdController.Controllers
{
    [Route("api/[controller]")]
    public class OtpController : Controller
    {
        private const int _otpCodeLifetimeMinutes = 15;
        private const int _otpCodeLength = 6;
        private static readonly string _codeCharacters = "1234567890";
        private static readonly string _metricPrefix = "otp";

        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IMetricsRegistry _metricsRegistry;
        private readonly IMemoryCache _activeOtps; // Mapping: (email -> OTP)
        private readonly IConfigurationHelper _configurationHelper;
        private readonly IEmailHelper _emailHelper;

        private readonly Random _randomGenerator;

        public OtpController(
            IHostingEnvironment hostingEnvironment,
            IMetricsRegistry metricRegistry,
            IMemoryCache memoryCache,
            IConfigurationHelper configurationHelper,
            IEmailHelper emailHelper)
        {
            _hostingEnvironment = hostingEnvironment;
            _metricsRegistry = metricRegistry;
            _activeOtps = memoryCache;
            _configurationHelper = configurationHelper;
            _emailHelper = emailHelper;
            _randomGenerator = new Random();
        }

        [HttpPost("generate")]
        public IActionResult GenerateOtp(string email)
        {
            var prefix = $"{_metricPrefix}.generate";

            if (!_configurationHelper.EnableOtp)
            {
                SendMetric($"{prefix}.forbidden");
                // Status code 404 -> resource not found (best way to say not available)
                return NotFound();
            }

            if (string.IsNullOrEmpty(email))
            {
                SendMetric($"{prefix}.bad_request");
                return BadRequest();
            }

            // TODO: Validate email

            // 1. Generate OTP and add it to cache (keyed by email)
            var otp = GenerateRandomCode();
            _activeOtps.Set(email, otp, TimeSpan.FromMinutes(_otpCodeLifetimeMinutes));

            // TODO: Check how to properly do this quick fix for OTP validation testing when doing development
            if (_hostingEnvironment.IsDevelopment())
                Console.Out.WriteLine($"New OTP code generated (valid for {_otpCodeLifetimeMinutes} minutes): {email} -> {otp}");

            // 2. Send email
            _emailHelper.SendOtpEmail(email, otp);

            // TODO: Emit glup for analytics

            // Status code 204 -> resource created but not content returned
            return NoContent();
        }

        [HttpPost("validate")]
        public IActionResult ValidateOtp(string email, string otp)
        {
            var prefix = $"{_metricPrefix}.validate";

            if (!_configurationHelper.EnableOtp)
            {
                SendMetric($"{prefix}.forbidden");
                // Status code 404 -> resource not found (best way to say not available)
                return NotFound();
            }

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(otp))
            {
                SendMetric($"{prefix}.bad_request");
                return BadRequest();
            }

            // Get code from cache and validate
            if (_activeOtps.TryGetValue(email, out string validOtp) && (otp == validOtp))
            {
                SendMetric($"{prefix}.valid");
                _activeOtps.Remove(email); // code is valid only once
                // TODO: Generate + set cookie?
                return Ok();
            }

            SendMetric($"{prefix}.invalid");

            return NotFound(); // TODO: Discuss what to return here
        }

        #region Helpers
        private string GenerateRandomCode()
        {
            return new string(Enumerable.Repeat(_codeCharacters, _otpCodeLength)
                .Select(s => s[_randomGenerator.Next(s.Length)]).ToArray());
        }

        private void SendMetric(string metric)
        {
            _metricsRegistry.GetOrRegister(metric, () => new Counter(Granularity.CoarseGrain)).Increment();
        }
        #endregion
    }
}
