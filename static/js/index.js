// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        file_name: null, // File name
        file_type: null, // File type
        file_date: null, // Date when file uploaded
        file_path: null, // Path of file in GCS
        file_size: null, // Size of uploaded file
        download_url: null, // URL to download a file
        uploading: false, // upload in progress
        deleting: false, // delete in progress
        delete_confirmation: false, // Show the delete confirmation thing.
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.file_info = function () {
        let info = "";
        if (app.vue.file_size) {
            info = app.vue.file_size.toString();
        }
        if (app.vue.file_type) {
            if (info) {
                info += " " + app.vue.file_type;
            } else {
                info = app.vue.file_type;
            }
        }
        if (info) {
            info = " (" + info + ")";
        }
        if (app.vue.file_date) {
            let d = new Sugar.Date(app.vue.file_date + "+00:00");
            info += ", uploaded " + d.relative();
        }
        return app.vue.file_name + info;
    }


    app.set_result = function (r) {
        // Sets the results after a server call.
        app.vue.file_name = r.data.file_name;
        app.vue.file_type = r.data.file_type;
        app.vue.file_date = r.data.file_date;
        app.vue.file_path = r.data.file_path;
        app.vue.file_size = r.data.file_size;
        app.vue.downloar_url = r.data.download_url;
    }

    app.upload_file = function (event) {
        let input = event.target;
        let file = input.files[0];
        if (file) {
            app.vue.uploading = true;
            let file_type = file.type;
            let file_name = file.name;
            let file_size = file.size;
            // Requests the upload URL.
            axios.post(obtain_gcs_url, {
                action: "PUT",
                mimetype: file_type,
                file_name: file_name
            }).then ((r) => {
                let upload_url = r.data.signed_url;
                let file_path = r.data.file_path;
                // Uploads the file, using the low-level interface.
                let req = new XMLHttpRequest();
                // We listen to the load event = the file is uploaded, and we call upload_complete.
                // That function will notify the server `of the location of the image.
                req.addEventListener("load", function () {
                    app.upload_complete(file_name, file_type, file_size, file_path);
                });
                // TODO: if you like, add a listener for "error" to detect failure.
                req.open("PUT", upload_url, true);
                req.send(file);
            });
        }
    }

    app.upload_complete = function (file_name, file_type, file_size, file_path) {
        // We need to let the server know that the upload was complete;
        axios.post(notify_url, {
            file_name: file_name,
            file_type: file_type,
            file_path: file_path,
            file_size: file_size,
        }).then( function (r) {
            app.vue.uploading = false;
            app.vue.file_name = file_name;
            app.vue.file_type = file_type;
            app.vue.file_path = file_path;
            app.vue.file_date = r.data.file_date;
            app.vue.download_url = r.data.download_url;
        });
    }

    app.delete_file = function () {
        if (!app.vue.delete_confirmation) {
            // Ask for confirmation before deleting it.
            app.vue.delete_confirmation = true;
        } else {
            // It's confirmed.
            app.vue.delete_confirmation = false;
            app.vue.deleting = true;
            // Obtains the delete URL.
            let file_path = app.vue.file_path;
            axios.post(obtain_gcs_url, {
                action: "DELETE",
                file_path: file_path,
            }).then(function (r) {
                let delete_url = r.data.signed_url;
                if (delete_url) {
                    // Performs the deletion request.
                    let req = new XMLHttpRequest();
                    req.addEventListener("load", function () {
                        app.deletion_complete(file_path);
                    });
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("DELETE", delete_url);
                    req.send();

                }
            });
        }
    };

    app.deletion_complete = function (file_path) {
        // We need to notify the server that the file has been deleted on GCS.
        axios.post(delete_url, {
            file_path: file_path,
        }).then (function (r) {
            app.vue.deleting =  false;
            app.vue.file_name = null;
            app.vue.file_type = null;
            app.vue.file_date = null;
            app.vue.download_url = null;
        })
    }

    app.download_file = function () {
        if (download_url) {
            let req = new XMLHttpRequest();
            req.addEventListener("load", function () {
                app.do_download(req);
            });
            req.open("GET", app.vue.downloar_url);
            req.send();
        }
    };

    app.do_download = function (req) {
        let blob = new Blob(req.response);
        let data_url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = data_url;
        a.download = app.vue.file_name;
        a.click();
        a.remove();
        URL.revokeObjectURL(data_url);
    };

    app.computed = {
        file_info: app.file_info,
    };

    // This contains all the methods.
    app.methods = {
        upload_file: app.upload_file, // Uploads a selected file
        delete_file: app.delete_file, // Delete the file.
        download_file: app.download_file, // Downloads it.
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        computed: app.computed,
        methods: app.methods,
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.
        axios.get(file_info_url)
            .then(function (r) {
                app.set_result(r);
            });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);