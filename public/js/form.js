document.addEventListener("DOMContentLoaded", function () {
   const form = document.getElementById("updateForm");

   if (!form) {
       console.error("❌ Form element not found!");
       return;
   }

   form.addEventListener("submit", async function (e) {
       e.preventDefault();

       // Fetch input elements
       const textInput = document.getElementById("nextText");
       const imageInput = document.getElementById("imageUpload");
       const jsonInput = document.getElementById("jsonUpload");

       if (!textInput || !imageInput || !jsonInput) {
           console.error("❌ One or more form elements are missing!");
           return;
       }

       // Create FormData
       let formData = new FormData();
       formData.append("newText", textInput.value);
       
       if (imageInput.files.length > 0) {
           formData.append("image", imageInput.files[0]);
       } else {
           console.warn("⚠️ No image selected, skipping.");
       }

       if (jsonInput.files.length > 0) {
           formData.append("json", jsonInput.files[0]);
       } else {
           console.warn("⚠️ No JSON file selected, skipping.");
       }


       try {
           const response = await fetch("http://localhost:3000/update-json", {
               method: "POST",
               body: formData
           });

           if (response.ok) {
               let blob = await response.blob();
               let link = document.createElement("a");
               link.href = URL.createObjectURL(blob);
               link.download = "updated_canvas.png";
               document.body.appendChild(link); // Add to DOM before clicking
               link.click();
               document.body.removeChild(link); // Remove after clicking

               alert("✅ Canvas updated and image downloaded successfully!");
           } else {
               alert("❌ Error updating canvas. Please check the server logs.");
           }
       } catch (error) {
           console.error("❌ Fetch error:", error);
           alert("❌ Something went wrong. Check the console for details.");
       }
   });
});
