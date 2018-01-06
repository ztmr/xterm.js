
var data =
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
    '<foreignObject width="100%" height="100%">' +
    '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
    '<em>I</em> like ' +
    '<span style="color:white; text-shadow:0 0 2px blue;"><a href="/document/2018/FCZK/123/accounting" target="_blank">cheese</a></span>' +
    '</div>' +
    '</foreignObject>' +
    '</svg>';

var linkLayer = document.getElementById("xterm-link-layer");
var ctx = linkLayer.getContext('2d');
var DOMURL = window.URL || window.webkitURL || window;
var img = new Image ();
var svg = new Blob ([data], {type: 'image/svg+xml'});
var url = DOMURL.createObjectURL(svg);

img.onload = function () {
    ctx.drawImage(img, 0, 0);
    DOMURL.revokeObjectURL(url);
};

img.src = url;





// ---------------------


        var canvas, ctx;
        var linkText = "IDEA Home";
        var linkURL = "http://www.idea.cz";
        var linkX = 50;
        var linkY = 25;
        var linkHeight = 15;
        var linkWidth;
        var isLink = false;
 
 
        function drawHyperLink() {
            canvas = document.getElementById("xterm-cursor-layer");
            // check if supported
            if (canvas.getContext) {
                ctx = canvas.getContext("2d");
                ctx.font = linkHeight + 'px sans-serif';
                ctx.fillStyle = "#0000ff";
                ctx.fillText(linkText, linkX, linkY);
                linkWidth = ctx.measureText(linkText).width;
 
                canvas.addEventListener("mousemove", CanvasMouseMove, false);
                canvas.addEventListener("click", Link_click, false);
            }
        }
        function CanvasMouseMove(e) {
            var x, y;
            if (e.layerX || e.layerX == 0) { // for firefox
                x = e.layerX;
                y = e.layerY;
            }
            x -= canvas.offsetLeft;
            y -= canvas.offsetTop;
 
            if (x >= linkX && x <= (linkX + linkWidth) 
                    && y <= linkY && y >= (linkY - linkHeight)) {
                document.body.style.cursor = "pointer";
                isLink = true;
            }
            else {
                document.body.style.cursor = "";
                isLink = false;
            }
        }
 
        function Link_click(e) {
            if (isLink) {
                window.open(linkURL, '_blank');
            }
        }
