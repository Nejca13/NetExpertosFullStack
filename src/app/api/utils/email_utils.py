import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

# Configuración del servidor SMTP
smtp_server = "smtp.gmail.com"
smtp_port = 587
email = "desarrollo.nca@gmail.com"
password = "jitr phsl sjkl aass"


# Función para enviar el correo electrónico con el OTP
def send_otp_email(username, otp):
    subject = "Código de verificación para registro"
    body = f"Su código de verificación es: {otp}"

    message = MIMEMultipart()
    message["From"] = email
    message["To"] = username
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(email, password)
        server.sendmail(email, username, message.as_string())
