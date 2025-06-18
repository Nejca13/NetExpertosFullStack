import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

# Configuración del servidor SMTP
smtp_server = "c2710770.ferozo.com"
smtp_port = 465  # Puerto estándar para SMTP con cifrado TLS
email = "verify@netexpertos.com"
password = "AF/1J6E5kK"


# Función para enviar el correo electrónico con el OTP
def send_otp_email(username, otp):
    subject = "Código de verificación para registro"
    body = f"Su código de verificación es: {otp}"

    message = MIMEMultipart()
    message["From"] = email
    message["To"] = username
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:

        server.login(email, password)
        server.sendmail(email, username, message.as_string())
