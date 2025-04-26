document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const status = document.getElementById("status");
    status.textContent = "Uploading...";

    try {
        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
        });

        const text = await response.text();
        status.textContent = text;
    } catch (error) {
        status.textContent = "Error uploading file!";
        console.error(error);
    }
});
