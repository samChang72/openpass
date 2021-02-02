using System;
using System.Collections.Generic;
using Criteo.IdController.Helpers;
using Metrics;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;

namespace Criteo.IdController.UTest
{
    [TestFixture]
    public class EmailHelperTests
    {
        #region Email configuration
        [Test]
        public void UserConfigurationTest()
        {
            var fakeSettings = new Dictionary<string, string> {
                { "Email:Server:Host", "mail.example.com" },
                { "Email:Server:Port", "25" },
                { "Email:Server:EnableSsl", "true" },
                { "Email:Sender:DisplayName", "DisplayName" },
                { "Email:Sender:Address", "sender@example.com" },
                { "Email:Authentication:UserName", "AuthName" },
                { "Email:Authentication:Password", "AuthPass" }
            };

            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(fakeSettings)
                .Build();

            var emailConfig = new EmailConfiguration(configuration);

            Assert.Multiple(() =>
            {
                Assert.AreEqual(emailConfig.MailServer, "mail.example.com");
                Assert.AreEqual(emailConfig.MailServerPort, 25);
                Assert.AreEqual(emailConfig.MailServerSsl, true);
                Assert.AreEqual(emailConfig.SenderDisplayName, "DisplayName");
                Assert.AreEqual(emailConfig.SenderEmailAddress, "sender@example.com");
                Assert.AreEqual(emailConfig.AuthUserName, "AuthName");
                Assert.AreEqual(emailConfig.AuthPassword, "AuthPass");
            });
        }

        [Test]
        public void DefaultConfigurationTest()
        {
            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(null)
                .Build();

            var emailConfig = new EmailConfiguration(configuration);

            Assert.Multiple(() =>
            {
                Assert.AreEqual(emailConfig.MailServer, "mail-relay.service.consul");
                Assert.AreEqual(emailConfig.MailServerPort, 25);
                Assert.AreEqual(emailConfig.MailServerSsl, false);
                Assert.AreEqual(emailConfig.SenderDisplayName, "OpenPass");
                Assert.AreEqual(emailConfig.SenderEmailAddress, "id-persistence@criteo.com");
                Assert.AreEqual(emailConfig.AuthUserName, null);
                Assert.AreEqual(emailConfig.AuthPassword, null);
            });
        }
        #endregion
    }
}