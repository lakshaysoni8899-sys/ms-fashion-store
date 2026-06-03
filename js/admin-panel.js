import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const IMGBB_API_KEY = "50fb6523dfd7bd20e425c539128a6b23";

document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.querySelector("button[type='button']");

    submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log("📍 STEP 1: Button Clicked");

        const imageFiles = document.getElementById("product-images").files;

        if (imageFiles.length === 0) {
            alert("Please click the upload box and select an image first!");
            return;
        }

        const originalText = submitBtn.innerText;

        try {
            submitBtn.innerText = "Uploading Images to Cloud...";
            submitBtn.disabled = true;

            const uploadedImageUrls = [];
            console.log("📍 STEP 2: Starting ImgBB Upload");

            for (let i = 0; i < imageFiles.length; i++) {
                const formData = new FormData();
                formData.append("image", imageFiles[i]);

                const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    uploadedImageUrls.push(data.data.url);
                    console.log("📍 STEP 3: ImgBB Upload Success ->", data.data.url);
                } else {
                    throw new Error("ImgBB Failed to return success");
                }
            }

            submitBtn.innerText = "Saving to Database...";
            console.log("📍 STEP 4: Preparing Firebase Data");

            const title = document.getElementById("product-title").value;
            const price = document.getElementById("product-price").value;

            const newProduct = {
                title: title,
                price: price,
                images: uploadedImageUrls,
                createdAt: new Date().toISOString()
            };

            console.log("📍 STEP 5: Sending Data to Firebase...");

            await addDoc(collection(db, "products"), newProduct);

            console.log("📍 STEP 6: Firebase Save Complete!");

            alert("Success! Your Kurti and photos are live on the cloud!");

            console.log("📍 STEP 7: Resetting HTML Form");
            document.getElementById("product-form").reset();

            console.log("📍 STEP 8: ALL DONE!");

        } catch (error) {
            console.error("🚨 CRASH REPORT:", error);
            alert("An error occurred. Please check the Console.");
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
});