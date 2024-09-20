from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import os

def generate_invoice(invoice_data, file_path):
    """
    Generates a PDF invoice with a structured table for products.

    :param invoice_data: Dictionary containing invoice details.
    :param file_path: Path to save the generated PDF.
    """
    # Get the directory of the current script
    current_directory = os.path.dirname(os.path.abspath(__file__))
    # Combine it with the font file name
    font_path = os.path.join(current_directory, "DejaVuSans.ttf")

    # Register the font with ReportLab
    pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))

    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter

    # Title
    c.setFont("DejaVuSans", 24)  # Use the registered font
    c.drawString(30, height - 50, "Invoice")

    # Customer Information
    c.setFont("DejaVuSans", 12)
    c.drawString(30, height - 100, f"Customer: {invoice_data['customer_name']}")
    c.drawString(30, height - 120, f"Email: {invoice_data['customer_email']}")

    # Invoice Information
    c.drawString(30, height - 160, f"Invoice Number: {invoice_data['invoice_number']}")
    c.drawString(30, height - 180, f"Date: {invoice_data['invoice_date']}")

    # Table Header
    header_y = height - 220
    table_start_x = 30
    table_end_x = 500
    table_row_height = 40

    # Draw table header background
    c.setFillColor(colors.lightgrey)
    c.rect(table_start_x, header_y - table_row_height, table_end_x - table_start_x, table_row_height, stroke=0, fill=1)
    c.setFillColor(colors.black)

    # Table Column Titles
    c.setFont("DejaVuSans", 12)
    c.drawString(35, header_y - 30, "Product")
    c.drawString(200, header_y - 30, "Quantity")
    c.drawString(300, header_y - 30, "Price")
    c.drawString(400, header_y - 30, "Total")

    # Table Rows
    y_position = header_y - table_row_height
    product_column_width = 150  # Set a fixed width for the product column to wrap text
    for item in invoice_data['items']:
        y_position -= table_row_height

        # Draw product row background
        c.setFillColor(colors.whitesmoke)
        c.rect(table_start_x, y_position, table_end_x - table_start_x, table_row_height, stroke=0, fill=1)
        c.setFillColor(colors.black)

        # Draw product details with text wrapping
        c.setFont("DejaVuSans", 12)
        product_lines = simpleSplit(item['product'], "DejaVuSans", 12, product_column_width)
        text_y = y_position + table_row_height - 15
        for line in product_lines:
            c.drawString(35, text_y, line)
            text_y -= 14  # Adjust line spacing for the wrapped text

        # Draw other product details
        c.drawString(200, y_position + 10, str(item['quantity']))
        c.drawString(300, y_position + 10, f"₹{item['price']:.2f}")
        c.drawString(400, y_position + 10, f"₹{item['total']:.2f}")

        # Draw borders for each cell
        c.setStrokeColor(colors.black)
        c.line(table_start_x, y_position, table_end_x, y_position)  # Bottom border
        c.line(table_start_x, y_position + table_row_height, table_end_x, y_position + table_row_height)  # Top border
        c.line(30, y_position, 30, y_position + table_row_height)  # Left border
        c.line(500, y_position, 500, y_position + table_row_height)  # Right border
        c.line(195, y_position, 195, y_position + table_row_height)  # Quantity separator
        c.line(295, y_position, 295, y_position + table_row_height)  # Price separator
        c.line(395, y_position, 395, y_position + table_row_height)  # Total separator

    # Draw the total amount and savings at the end of the table
    c.setFont("DejaVuSans", 12)
    c.drawString(300, y_position - 20, f"Total Amount: ₹{invoice_data['total_amount']:.2f}")
    
    # Savings Section
    y_position -= 40
    c.setFont("DejaVuSans", 12)
    c.setFillColor(colors.green)
    c.drawString(30, y_position, f"Total Savings: ₹{invoice_data.get('savings', 0):.2f}")
    c.setFillColor(colors.black)

    # Save the PDF file
    c.save()

# Example usage
invoice_data = {
    'customer_name': 'John Doe',
    'customer_email': 'john.doe@example.com',
    'invoice_number': 'INV-001',
    'invoice_date': '2024-09-20',
    'items': [
        {'product': 'Product 1', 'quantity': 2, 'price': 100.0, 'total': 200.0},
        {'product': 'Product 2', 'quantity': 1, 'price': 50.0, 'total': 50.0}
    ],
    'total_amount': 250.0,
    'savings': 10.0
}
file_path = "invoice.pdf"
generate_invoice(invoice_data, file_path)
