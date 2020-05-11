var textArea;
var text;

init();

function init() {

    try {
        text = window.location.pathname.split("/").pop();

        // https://www.sitepoint.com/hide-elements-in-css/
        document.getElementById("copyButton").style.visibility = "";
    } catch (e) {
        console.log("cannot set text to copy");
    }
}

document.getElementById("copyButton").onclick = function () {
    console.log("copy button clicked!!");
    copyTextToClipboard();
};

function copyTextToClipboard() {
    if (navigator.clipboard) {
        copyTextToClipboardStandard();
    } else {
        if (typeof ClipboardEvent !== "function") {
            setCopyInputField();
        }

        try {
            // Source: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript/30810322#30810322
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('(3) Copying text command was ' + msg);
        } catch (err) {
            console.log('(3) Oops, unable to copy');
        }

        if (typeof ClipboardEvent !== "function") {
            removeCopyInputField();
        }
    }
}
function copyTextToClipboardStandard() {
    navigator.clipboard.writeText(text).then(function () {
        console.log('(1) Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('(1) Async: Could not copy text: ', err);
    });
}

document.addEventListener('copy', function (e) {
    // First check if the ASYNC approach is available.
    // I check this here and not the final fallback because a copy event can happen without the user pressing a button
    if (navigator.clipboard) {
        copyTextToClipboardStandard(text);
    } else if (typeof ClipboardEvent === "function") {
        try {
            e.clipboardData.setData('text/plain', text);
            // default behaviour is to copy any selected text
            e.preventDefault();
            console.log('(2) copied!');
        } catch (err) {
            console.log('(2) Oops, unable to copy');
        }
    }
});

// Source: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript/30810322#30810322
function setCopyInputField() {
    textArea = document.createElement("textarea");

    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a
    // flash, so some of these are just precautions. However in
    // Internet Explorer the element is visible whilst the popup
    // box asking the user for permission for the web page to
    // copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';

    textArea.value = text;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
}

function removeCopyInputField() {
    document.body.removeChild(textArea);
}