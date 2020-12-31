//console.log("sanity check");
(function () {
    //functions to getComments and Images with formated Data//
    const formateDateTime = (date) => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(new Date(date));
    };

    const getCommentsWithFormatedDate = (res) => {
        var comments = [];
        for (var i = 0; i < res.data.length; i++) {
            var fullDate = formateDateTime(res.data[i].created_at);
            var comment = {
                comment: res.data[i].comment,
                created_at: fullDate,
                name: res.data[i].name,
            };
            comments.push(comment);
        }
        return comments;
    };

    const getSingleImageWithFormatedDate = (res, self) => {
        var fullDate = formateDateTime(res.data[0].created_at);
        self.url = res.data[0].url;
        self.title = res.data[0].title;
        self.description = res.data[0].description;
        self.username = res.data[0].username;
        self.createdAt = fullDate;
        self.prevImg = res.data[0].prevImg;
        self.nextImg = res.data[0].nextImg;
        self.maxId = res.data[0].maxId;
        self.minId = res.data[0].minId;
    };

    //Vue Components//

    Vue.component("comments-component", {
        template: "#childTemplate",
        props: ["imageId"],
        data: function () {
            return {
                comments: [],
                name: "",
                comment: "",
                createdAt: "",
            };
        },
        mounted: function () {
            var self = this;
            axios
                .get("/comments/" + this.imageId)
                .then(function (res) {
                    self.comments = getCommentsWithFormatedDate(res);
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        watch: {
            imageId: function () {
                var self = this;
                axios
                    .get("/comments/" + this.imageId)
                    .then(function (res) {
                        self.comments = getCommentsWithFormatedDate(res);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
        },

        methods: {
            postComments: function (event) {
                var self = this;
                event.preventDefault();
                var commentsData = {
                    name: this.name,
                    comment: this.comment,
                    imageId: this.imageId,
                };

                axios
                    .post("/comments", commentsData)
                    .then(function (res) {
                        console.log("res.data from post/comments", res.data);
                        console.log("self.comments", self.comments);
                        var newComment = {
                            comment: res.data.comment,
                            name: res.data.name,
                            created_at: formateDateTime(res.data.created_at),
                        };
                        self.comments.unshift(newComment);
                        self.name = "";
                        self.comment = "";
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
                    if (self.imageId == res.data[0].maxId) {
                        document
                            .getElementById("prev-image")
                            .classList.add("hidden");
                        document
                            .getElementById("next-image")
                            .classList.remove("hidden");
                    } else if (self.imageId == res.data[0].minId) {
                        document
                            .getElementById("next-image")
                            .classList.add("hidden");
                        document
                            .getElementById("prev-image")
                            .classList.remove("hidden");
                    } else {
                        document
                            .getElementById("next-image")
                            .classList.remove("hidden");
                        document
                            .getElementById("prev-image")
                            .classList.remove("hidden");
                    }
                    self.images = getSingleImageWithFormatedDate(res, self);
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
                        if (self.imageId == res.data[0].maxId) {
                            document
                                .getElementById("prev-image")
                                .classList.add("hidden");
                            document
                                .getElementById("next-image")
                                .classList.remove("hidden");
                        } else if (self.imageId == res.data[0].minId) {
                            document
                                .getElementById("next-image")
                                .classList.add("hidden");
                            document
                                .getElementById("prev-image")
                                .classList.remove("hidden");
                        } else {
                            document
                                .getElementById("next-image")
                                .classList.remove("hidden");
                            document
                                .getElementById("prev-image")
                                .classList.remove("hidden");
                        }
                        self.images = getSingleImageWithFormatedDate(res, self);
                    })
                    .catch(function (err) {
                        console.log("error in axios get main/image:", err);
                        self.$emit("close");
                    });
            },
        },

        methods: {
            closeModal: function () {
                this.$emit("close");
            },
            getPrevImage: function () {
                var self = this;
                console.log(self);
                axios
                    .get("/main/" + self.prevImg)
                    .then(function () {
                        if (self.prevImg == self.maxId) {
                            document
                                .getElementById("prev-image")
                                .classList.add("hidden");
                        } else {
                            document
                                .getElementById("next-image")
                                .classList.remove("hidden");
                        }
                        location.hash = self.prevImg;
                    })
                    .catch(function (err) {
                        console.log("error in getPrevImage:", err);
                        self.$emit("close");
                    });
            },

            getNextImage: function () {
                var self = this;
                console.log(self.imageId, self.nextImg);
                axios
                    .get("/main/" + self.nextImg)
                    .then(function () {
                        if (self.nextImg == self.minId) {
                            console.log(self.nextImg, self.minId);
                            location.hash = self.nextImg;
                            document
                                .getElementById("next-image")
                                .classList.add("hidden");
                        } else {
                            location.hash = self.nextImg;
                            document
                                .getElementById("prev-image")
                                .classList.remove("hidden");
                        }
                    })
                    .catch(function (err) {
                        console.log("error in getNextImage:", err);
                        self.$emit("close");
                    });
            },
            deleteImage: function () {
                console.log("deleteImage runs");
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
                self.imageId = location.hash.slice(1);
                //console.log(location.hash.slice(1));
            });
        },
        methods: {
            handleFileChange: function (event) {
                var self = this;
                self.file = event.target.files[0];
                var upload = document.getElementsByClassName("upload");
                var label = document.getElementById("label");

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

                axios
                    .post("/upload", formData)
                    .then(function (res) {
                        self.images.unshift(res.data);
                        self.title = "";
                        self.description = "";
                        self.userName = "";
                        var label = document.getElementById("label");
                        label.innerHTML = "Choose an Image";
                    })
                    .catch((err) => {
                        console.log(err);
                    });
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
                            if (res.data[i].id === res.data[i].lowestId) {
                                self.images.push(res.data[i]);
                                document
                                    .getElementById("more-button")
                                    .classList.add("hidden");
                            } else {
                                self.images.push(res.data[i]);
                            }
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },
        },
    });
})();
