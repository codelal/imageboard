//console.log("sanity check");
(function () {
    function newDate(createdAt) {
        var date = "";
        date += createdAt;
        var dateOne = date.slice(0, 10);
        var dateTwo = date.slice(11, 16);
        var fullDate = `${dateOne} ${dateTwo}`;
        return fullDate;
    }

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
                    console.log("get/comments", res.data);
                    self.comments = res.data;
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        watch: {
            imageId: function () {
                //console.log("imgId prop updated");
                var self = this;
                axios
                    .get("/comments/" + this.imageId)
                    .then(function (res) {
                        // console.log("get/comments", res.data);
                        self.comments = res.data;
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
        },

        methods: {
            postComments: function (event) {
                var self = this;
                //console.log("sendComments works");
                event.preventDefault();
                var commentsData = {
                    name: this.name,
                    comment: this.comment,
                    imageId: this.imageId,
                };
                // console.log("commentsData", commentsData);
                axios
                    .post("/comments", commentsData)
                    .then(function (res) {
                        console.log("res.data from post/comments", res.data);
                        self.comments.unshift(res.data);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
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
                    var fullDate = newDate(res.data[0].created_at);
                    console.log("fulldate", fullDate);

                    self.url = res.data[0].url;
                    self.title = res.data[0].title;
                    self.description = res.data[0].description;
                    console.log("description", res.data[0].description);
                    self.username = res.data[0].username;
                    self.createdAt = fullDate;
                })
                .catch(function (err) {
                    console.log("error in axios get main/image:", err);
                    self.$emit("close");
                });
        },

        watch: {
            imageId: function () {
                // console.log("imgId prop updated");
                var self = this;
                axios
                    .get("/main/" + self.imageId)
                    .then(function (res) {
                        // self.fullScreenImage = res.data[0];
                        //  console.log("res from axios", res);
                        var fullDate = newDate(res.data[0].created_at);
                        console.log("fulldate", fullDate);

                        self.url = res.data[0].url;
                        self.title = res.data[0].title;
                        self.description = res.data[0].description;
                        self.username = res.data[0].username;
                        self.createdAt = fullDate;
                    })
                    .catch(function (err) {
                        console.log("error in axios get main/image:", err);
                        self.$emit("close");
                    });
            },
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
            description: "",
            file: null,
            imageId: location.hash.slice(1),
            id: "",
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

            addEventListener("hashchange", function () {
                //  console.log("hash has changed to actual Id of the image");
                //  console.log(self.imageId);
                self.imageId = location.hash.slice(1);
            });
        },
        methods: {
            handleFileChange: function (event) {
                var self = this;
                self.file = event.target.files[0];
                //console.log(this.file);
                var upload = document.getElementsByClassName("upload");
                var label = document.getElementById("label");
                //console.log(label);

                upload[0].addEventListener("change", function () {
                    if (self.file) {
                        label.innerHTML = self.file.name;
                    }
                });
            },
            handleUpload: function (event) {
                var self = this;
                event.preventDefault();
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("file", this.file);
                formData.append("userName", this.userName);
                formData.append("description", this.description);
                var inputVal = document.getElementsByClassName("inputtext");
                

                axios
                    .post("/upload", formData)
                    .then(function (res) {
                        // console.log("response from upload", res.data);
                        self.images.unshift(res.data);
                        //console.log(this);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },

            deleteInputVal: function () {
                
            },

            closeImage: function () {
                this.imageId = null;
                location.hash = "";
                history.pushState({}, "", "/");
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
