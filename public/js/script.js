//console.log("sanity check");

new Vue({
    el: "#main",
    data: {
        images: [],
        title: "",
        imageDescription: "",
        filename: "",
        file: null,
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
    methods: {
        handleFileChange: function (event) {
            console.log("event target", event);
            // Set the data's "image" property to the newly uploaded file
            this.image = event.target.files[0];
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
            formData.append("filename", this.name);
            formData.append("file", this.file);

            axios.post("/upload", formData).then((res) => {
                console.log("passt", res);
            });
        },
    },
});
