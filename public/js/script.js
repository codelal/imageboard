//console.log("sanity check");
(function () {
    Vue.component("vue-component", {
        template: "#template",
        props: ["imageId"],
        data: function () {
            return {
                url: "",
                title: "",
                description: "",
                username: "",
                createdAt: "",
            };
        },
        mounted: function () {
            var self = this;
            // console.log("props id in vue component", self);

            axios
                .get("/main/" + self.imageId)
                .then(function (res) {
                    // self.fullScreenImage = res.data[0];
                    //  console.log("res from axios", res);
                    self.url = res.data[0].url;
                    self.title = res.data[0].title;
                    self.description = res.data[0].description;
                    self.username = res.data[0].username;
                    self.createdAt = res.data[0].created_at;
                })
                .catch(function (err) {
                    console.log("error in axios get main/image:", err);
                });
        },
        methods: {
            closeModal: function () {
                // console.log("closeModal is running!");
                //console.log("about to emit an event from the component!!");
                this.$emit("close");
            },
        },
    });

    new Vue({
        el: "#main",
        data: {
            images: [],
            title: "",
            userName: "",
            imageDescription: "",
            file: null,
            imageId: null,
        },
        mounted: function () {
            var self = this;
            axios
                .get("/main")
                .then(function (res) {
                    self.images = res.data;
                    // console.log("self.images", self.images);
                })
                .catch(function (err) {
                    console.log("error:", err);
                });
        },
        methods: {
            handleFileChange: function (event) {
                this.file = event.target.files[0];
            },
            handleUpload: function (event) {
                event.preventDefault();
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("file", this.file);
                formData.append("userName", this.userName);
                formData.append("imageDescription", this.imageDescription);

                axios
                    .post("/upload", formData)
                    .then((res) => {
                        // console.log("response from upload", res.data);
                        this.images.unshift(res.data);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },
            getIdbyClick: function (id) {
                this.imageId = id;
                // console.log(this.imageId);
            },
            closeImage: function () {
                this.imageId = null;
                // console.log(
                //     "closeImage in the instance / parent is running! This was emitted from the component"
                // );
            },
            showMoreImages: function () {
                //console.log("button to show more images");
                // console.log("latest id", this.images[0].id);

                //console.log("self in showMoreImages", self);
                // console.log("this in showMoreImages", this.images);
                var addNewImages = this;
                axios.get("/more/" + this.images[2].id).then(function (res) {
                  addNewImages.images.push(res.data);
                    console.log(
                        "res from showMoreImages",

                        addNewImages.images
                    );
                    // this.images.push(res.data);
                });
            },
        },
    });
})();
