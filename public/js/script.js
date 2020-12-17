//console.log("sanity check");
(function () {
    Vue.component("comments-component", {
        template: "#childTemplate",
        props: ["imageId"],
        data: function () {
            return {
                comments: [],
                name: "",
                comment: "",
            };
        },
        mounted: function () {
            var self = this;
            // console.log("mounted in childComponent works", this.imageId);

            axios
                .get("/comments/" + this.imageId)
                .then(function (res) {
                    console.log(res);
                    self.comments = res.data;
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        methods: {
            sendComments: function () {
                console.log("sendComments works");
                axios.post("/comments");
            },
        },
    });

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
            // console.log("props id in vue component", self.imageId);

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
                var self = this;
                var j = self.images.length - 1;

                axios
                    .get("/more/" + self.images[j].id)
                    .then(function (res) {
                        for (var i = 0; i < res.data.length; i++) {
                            // console.log("id", id);
                            if (res.data[i].id === res.data[i].lowestId) {
                                self.images.push(res.data[i]);
                                document
                                    .getElementById("more-button")
                                    .classList.add("hidden");
                            } else {
                                self.images.push(res.data[i]);
                            }
                        }

                        // console.log("res from showMoreImages", addNewImages.images);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },
        },
    });
})();
