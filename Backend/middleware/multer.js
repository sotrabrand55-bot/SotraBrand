import multer from "multer";

const storage = multer.memoryStorage(); // store files in memory to upload directly to ImageKit

/* this if i use cloudinary const storage = multer.diskStorage({  //multer.diskStorage({}) → This tells multer to store files on the server’s disk (file system).
  filename: function (req, file, callback) // --->> This function defines how uploaded files will be named.
   { 
    callback(null, file.originalname) // --->> ensures that the uploaded file keeps its original name. Example: If you upload "photo.jpg", it will be stored as "photo.jpg".
   }
})
*/
const upload = multer({storage}) // -->> This creates the upload instance, which will be used as middleware for handling file uploads.
// (storage )is passed to define where and how files are stored.
export default upload;

/* ----- explain for this ---------------
Multer is a middleware for handling file uploads in Node.js. */ 
