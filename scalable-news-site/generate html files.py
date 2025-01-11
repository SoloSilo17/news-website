import os

# Directory to save generated HTML files
output_dir = "generated_html"

# Ensure the directory exists
os.makedirs(output_dir, exist_ok=True)

# Function to generate an HTML file
def generate_html_file(file_name, title, content):
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Portal de noticias en español con las últimas actualizaciones nacionales e internacionales">
    <meta name="keywords" content="noticias, deportes, cultura, internacional">
    <meta name="author" content="Noticias en Español">
    <title>Noticias en Español</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    </head>
    <body>
        <header>
            <h1>{title}</h1>
        </header>
        <main>
            {content}
        </main>
        <footer>
            <p>&copy; 2025 Notición. All rights reserved.</p>
        </footer>
    </body>
    </html>
    """

    # Write the HTML content to the file
    file_path = os.path.join(output_dir, file_name)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Generated: {file_path}")

# Example: Generate multiple HTML files
pages = [
    {"file_name": "index.html", "title": "Home", "content": "<p>Welcome to Notición!</p>"},
    {"file_name": "about.html", "title": "About Us", "content": "<p>About Notición...</p>"},
    {"file_name": "contact.html", "title": "Contact", "content": "<p>Contact us at contact@noticion.com.</p>"},
]

# Generate the files
for page in pages:
    generate_html_file(page["file_name"], page["title"], page["content"])
