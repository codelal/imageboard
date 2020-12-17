//console.log("sanity check");
(function () {
    // make sure your component is registered before your vue instance
    // 'my-component' - name of component that is rendered inside of main in index.html

    Vue.component("vue-component", {
        // this is what connects our HTML to our Vue component
        // MUST equal the id of our script tag
        template: "#template",
        props: ["imageId"],
        data: function () {
            return {
                url: "",
                title: "",
                description: "",
                username: "",
                created_at: "",
            };
        },
        mounted: function () {
            var self = this;
            console.log("props id in vue component", self.imageId);

            axios
                .get("/main/" + self.imageId)
                .then(function (res) {
                    // self.fullScreenImage = res.data[0];
                    console.log("res from axios", res);
                    self.url = res.data[0].url;
                    self.title = res.data[0].title;
                    self.description = res.data[0].description;
                    self.username = res.data[0].username;
                    self.created_at = res.data[0].created_at;
                })
                .catch(function (err) {
                    console.log("error in axios get main/image:", err);
                });
        },
        methods: {
            closeModal: function () {
                // console.log("closeModal is running!");
                console.log("about to emit an event from the component!!");
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
            // console.log("this in var self", self);
            axios
                .get("/main")
                .then(function (res) {
                    // console.log("response.data", res.data);
                    // console.log("this inside then", this);// shows windows object, has an other referencen than this
                    self.images = res.data;
                    // console.log("self.images", self.images);
                })
                .catch(function (err) {
                    console.log("error:", err);
                });
        },
        methods: {
            handleFileChange: function (event) {
                // console.log("event target", event);
                // Set the data's "file" property to the newly uploaded file
                //der upload eines neuen Files kann als change am eventObjekt, d.h. an event.target.file[0] regestriert werden.

                this.file = event.target.files[0];
            },
            handleUpload: function (event) {
                // console.log("click");
                event.preventDefault();
                // Prevent the default behavior (i.e navigating to a new page on submitting the form)

                //POST data to the /uploads path with axios, wir machen das manuell weil die default-Einstellung umgangen werden soll. Bei der Default-Einstellung würde das Browser-Fenster refreshed werden, bevor die Bilder gezeigt werden. Bilder sollen aber immedialty angezeigt werden.
                var formData = new FormData(); //
                //1.Create a FormData instance and append the relevant fields
                formData.append("title", this.title);
                formData.append("file", this.file);
                formData.append("userName", this.userName);
                formData.append("imageDescription", this.imageDescription);
                //console.log("formData is", formData);

                axios
                    .post("/upload", formData)
                    .then((res) => {
                        //das Result vom Post-request: res.data
                        console.log("response from upload", res.data);
                        this.images.unshift(res.data);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },
            getIdbyClick: function (id) {
                // console.log("click in  getIdbyClick");
                this.imageId = id;
                //  console.log("this imageId is", this.imageId);
            },
            closeImage: function () {
                //  set id to null
                this.imageId = null;
                console.log(
                    "closeImage in the instance / parent is running! This was emitted from the component"
                );
            },
        },
    });
})();
