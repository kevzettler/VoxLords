/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2015-01-19
/////////////////////////////////////////////////////////////
function Loader() {
    Loader.prototype.total = 0;
    Loader.prototype.loaded = 0;
    Loader.prototype.percentLoaded = 0;

    Loader.prototype.PercentLoaded = function() {
        return Math.round((Loader.prototype.loaded/Loader.prototype.total)*100);
    };

    Loader.prototype.Loaded = function() {
        Loader.prototype.loaded++;
    };
}

module.exports = Loader;