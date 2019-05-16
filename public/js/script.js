(function() {

    Vue.component("image-modal", {
        props: ["id"],
        template: "#image",
        data: function() {
            return {
                info: [],
                comments: [],
                form: {
                    comment: "",
                    username: ""
                }

            };
        },

        mounted: function() {
            document
                .getElementById("infoPopup")
                .addEventListener("click", function(e) {
                    e.stopPropagation();
                });
            var app = this;
            axios.get("/images/" + this.id).then(res => {

                app.info = res.data[0];


                app.comments = app.comments.concat(res.data);
                var commentArr = app.comments;
                commentArr.shift();

            });
        },

        methods: {
            closePopup: function() {
                this.$emit("close");
            },

            addComments: function(event) {
                event.preventDefault();
                var app = this;
                var commentInfo = {
                    user_id: this.id,
                    comment: this.form.comment,
                    username: this.form.username
                };

                axios.post("/images/" + this.id, commentInfo).then(res => {
                    console.log("resp in POST /upload: ", res.data[0]);
                    app.comments.unshift(res.data[0]);

                    app.form.comment = "";
                    app.form.username = "";
                }).catch(error => {
                    console.log(error);
                });
            }
        }
    });


    var app = new Vue({
        el: "#main",
        data: {
            images: [],
            id: "",
            show: "",
            form: {
                title: "",
                username: "",
                description: ""
            }
        },
        mounted: function() {
            var app = this;

            var imageId = location.hash.slice(1);

            axios.get("/images").then(function(res) {
                // console.log("Data we have: ", res.data);

                app.images = res.data;
                app.setCurrentImage(imageId);
                setTimeout(app.infiniteScroll, 1000);
            });
        },

        methods: {
            uploadFile: function(event) {
                event.preventDefault();

                var file = $('input[type="file"]').get(0).files[0];
                // console.log("File: ", file);
                var formData = new FormData(); // formData is used when we are dealing with Files.
                formData.append("file", file);

                formData.append("title", this.form.title);
                formData.append("description", this.form.description);
                formData.append("username", this.form.username);

                axios.post("/upload", formData).then(function(res) {
                    // console.log("resp in POST /upload: ", res);
                    app.images.unshift(res.data.image);

                    app.form.title = "";
                    app.form.description = "";
                    app.form.username = "";
                }).catch(error => {
                    console.log(error);
                });

                // console.log("Vue Instance: ", this);
            },
            hide: function() {
                if (this.show === true) {
                    var q = window.pageYOffset;
                    this.currentImage = null;
                    location.hash = "";
                    window.scrollTo(0, q);
                    this.show = false;
                    location.hash = "";
                }
            },
            setCurrentImage: function(image_id) {
                console.log("images: ", this.images);

                for (let i = 0; i < this.images.length; i++) {
                    if (image_id == this.images[i].id) {
                        this.id = image_id;
                        this.show = true;
                        break;
                    } else {
                        this.show = false;
                    }
                }

                console.log("Our Id is here: ", image_id);
            },

            infiniteScroll: function() {
                var app = this;
                var docHeight = document.body.clientHeight;
                var windowHeight = window.innerHeight;
                var offSetY = pageYOffset;
                var height = windowHeight + offSetY;
                // console.log("Document Height: ", docHeight);
                // console.log("Window Height: ", windowHeight);
                // console.log("offset Y: ", offSetY);
                if (height > docHeight) {
                    console.log("More Images are on the way");
                    this.getMoreImages();
                } else {
                    setTimeout(app.infiniteScroll, 800);
                }
            },

            getMoreImages: function() {
                var lastId = this.images[this.images.length - 1].id;
                // var lastImageId = this.images[this.images.length - 1].id;
                axios
                    .get("/moreImages", {
                        params: {
                            lastImageId: this.images[this.images.length - 1].id
                        }
                    })
                    .then(function(res) {
                        console.log("resp in POST /upload: ", res);
                        app.images = app.images.concat(res.data);
                        setTimeout(app.infiniteScroll, 800);
                    });
            },

            moveUp: function() {
                window.scrollTo(0, 0);
            }
        } // close methods
    }); // close vue instance
    ////////////////////////
    ///// Event Listeners:
    ///////////////////////
    //

    addEventListener("hashchange", () => {
        var imageId = location.hash.slice(1);
        app.setCurrentImage(imageId);
    });
})();
