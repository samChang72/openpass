﻿// Handy functions used by static sites

enum EventType {
    Unknown = 0,
    BannerRequest = 1,
    ConsentGranted = 2,
    ConsentNotGranted = 3,
    BannerIgnored = 4,
    LearnMore = 5,
    EmailShared = 6
}

class Utils {
    private static readonly eventUrl = "https://id-controller.crto.in/api/event"; // Use http://localhost:1234/api/event for development

    static eventType = EventType;

    static sendEvent(eventType: number, originHost: string): void {
        const targetUrl = this.generateTargetUrl(eventType, originHost);
        // TODO: Get localwebid, uid or ifa from cookies (or tags)

        fetch(targetUrl, {
            method: "POST",
            credentials: "include",
        })
        .catch((error) => console.error(`[IdController] Error when sending event: ${error}`));
    }

    private static generateTargetUrl(
        eventType: number,
        originHost: string,
        localwebid?: string,
        uid?: string,
        ifa?: string) : string {
        let targetUrl = `${this.eventUrl}?eventType=${eventType}&originHost=${originHost}`;

        if (localwebid)
            targetUrl += `&localwebid=${localwebid}`;
        if (uid)
            targetUrl += `&uid=${uid}`;
        if (ifa)
            targetUrl += `&ifa=${ifa}`;

        return targetUrl;
    }

    public static addPostMessageEvtListener(currentWindow: Window) {
        const evtListener = (event: MessageEvent) => {
            const data = event.data;

            // Discard messages coming from other iframes
            if (!data || !data.isIdControllerMessage) {
                return;
            }

            // Prevent the message to propagate to other listeners
            event.stopImmediatePropagation();

            if (data.ifa) {
                currentWindow.parent.postMessage({
                    isIdControllerMessage: true,
                    ifa: data.ifa,
                }, "*");
            }
        }

        currentWindow.addEventListener("message", evtListener, true);
    }
}
