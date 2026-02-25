<?php
// این هدرها خیلی مهمن تا React بتونه به PHP وصل بشه (CORS Error نگیری)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// مسیر فایل json
$file = 'data/menu.json';

// چک کن فایل هست یا نه
if (file_exists($file)) {
    // محتویات فایل رو بخون و چاپ کن
    echo file_get_contents($file);
} else {
    // اگه فایل نبود ارور بده
    echo json_encode(["error" => "Menu file not found"]);
}
?>