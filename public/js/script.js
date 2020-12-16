//console.log("sanity check");

new Vue({
    el: "#main",
    data: {
        images: [],
        title: "",
        userName: "",
        imageDescription: "",
        file: null,
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
            this.file = event.target.files[0];
        },
        handleUpload: function (event) {
            event.preventDefault();
            // Prevent the default behavior (i.e navigating to a new page on submitting the form)
            console.log("click");
            //POST data to the /uploads path with axios
            var formData = new FormData(); //
            //1.Create a FormData instance and append the relevant fields
            formData.append("title", this.title);
            formData.append("file", this.file);
            formData.append("userName", this.userName);
            formData.append("imageDescription", this.imageDescription);
            console.log("formData is", formData);

            axios
                .post("/upload", formData)
                .then((res) => {
                    console.log("response from upload", res.data);
                    this.images.unshift(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        },
    },
});
