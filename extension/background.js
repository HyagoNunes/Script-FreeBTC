chrome.runtime.onInstalled.addListener(() => {
    console.log('Void-Hub FreeBTC instalado com sucesso');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getState") {
        chrome.storage.local.get(['stateFreeBTC'], function(result) {
            sendResponse({state: result.stateFreeBTC || {}});
        });
        return true;
    }
});
 