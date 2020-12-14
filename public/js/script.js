//console.log("sanity check");

new Vue({
    el: "#main",
    data: {
        images: [],
    },
    mounted: function () {
        var self = this;
        console.log("this in var self", self);
        axios
            .get("/main")
            .then(function (res) {
                console.log("response.data", res.data);
                // console.log("this inside then", this);// shows windows object, has an other referencen than this
                self.images = res.data;
                console.log("self.images", self.images);
            })
            .catch(function (err) {
                console.log("error:", err);
            });
    },
});
