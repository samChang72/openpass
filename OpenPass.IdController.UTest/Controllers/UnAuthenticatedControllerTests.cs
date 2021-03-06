using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using OpenPass.IdController.Controllers;
using OpenPass.IdController.Helpers;

namespace OpenPass.IdController.UTest.Controllers
{
    [TestFixture]
    public class UnAuthenticatedControllerTests
    {
        private Mock<IMetricHelper> _metricHelperMock;
        private Mock<ICookieHelper> _cookieHelperMock;
        private Mock<IIdentifierHelper> _identifierHelperMock;
        private UnAuthenticatedController _unauthenticatedController;

        [SetUp]
        public void Setup()
        {
            _metricHelperMock = new Mock<IMetricHelper>();
            _metricHelperMock.Setup(mr => mr.SendCounterMetric(It.IsAny<string>()));
            _cookieHelperMock = new Mock<ICookieHelper>();
            _identifierHelperMock = new Mock<IIdentifierHelper>();

            _unauthenticatedController = new UnAuthenticatedController(_metricHelperMock.Object, _cookieHelperMock.Object, _identifierHelperMock.Object)
            {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };
        }

        [TestCase(false, null)]
        [TestCase(true, "uid2token")]
        public void CreateIfa_NoUid2CookiesExist_CreateNewIfaCookie(bool uid2CookieExists, string expectedUid2Cookie)
        {
            // Arrange
            var expectedIfaToken = "ifaToken";
            _cookieHelperMock.Setup(c => c.TryGetUid2AdvertisingCookie(It.IsAny<IRequestCookieCollection>(), out expectedUid2Cookie)).Returns(uid2CookieExists);
            _identifierHelperMock.Setup(x => x.GetOrCreateIfaToken(It.IsAny<IRequestCookieCollection>(), It.IsAny<string>()))
                .Returns(expectedIfaToken);

            // Act
            var response = _unauthenticatedController.CreateIfa();

            // Returned identifier
            var data = GetResponseData(response);
            var ifaToken = (string) data.ifaToken;
            var uid2Token = (string) data.uid2Token;

            // Assert
            Assert.AreEqual(expectedIfaToken, ifaToken);
            Assert.AreEqual(expectedUid2Cookie, uid2Token);

            _cookieHelperMock.Verify(x => x.SetIdentifierForAdvertisingCookie(
                It.IsAny<IResponseCookies>(),
                It.Is<string>(token => token == ifaToken)),
               Times.Once);
        }

        #region Helpers

        private static dynamic GetResponseData(IActionResult response)
        {
            var responseContent = response as OkObjectResult;
            var data = responseContent?.Value;

            return data;
        }

        #endregion Helpers
    }
}
