from PIL import Image
import os

# Ruta de la imagen original
input_path = r"C:/Users/Alejandro.Ruiz/.gemini/antigravity/brain/1255e26e-e47c-4b09-baac-d221cf8d9469/uploaded_media_1769463180800.png"

# Ruta de salida
output_path = r"C:/Users/Alejandro.Ruiz/.gemini/antigravity/brain/1255e26e-e47c-4b09-baac-d221cf8d9469/ideathon_1080x1920.png"

# Dimensiones objetivo
target_width = 1080
target_height = 1920

# Abrir la imagen
img = Image.open(input_path)
print(f"Tamaño original: {img.size}")

# Redimensionar la imagen
# Usamos LANCZOS para mejor calidad
resized_img = img.resize((target_width, target_height), Image.LANCZOS)

# Guardar la imagen redimensionada
resized_img.save(output_path, "PNG", quality=95)
print(f"Imagen redimensionada guardada en: {output_path}")
print(f"Nuevo tamaño: {resized_img.size}")
