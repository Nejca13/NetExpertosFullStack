import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.api.config.otp_config import (
    HOST_EMAIL,
    HOST_PASSWORD,
    HOST_SMTP_PORT,
    HOST_SMTP_SERVER,
)


# Función para enviar el correo electrónico con el OTP
def send_otp_email(username, otp):
    subject = "Código de verificación para registro"
    body = f"Su código de verificación es: {otp}"

    message = MIMEMultipart()
    message["From"] = HOST_EMAIL
    message["To"] = username
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP_SSL(HOST_SMTP_SERVER, HOST_SMTP_PORT) as server:

        server.login(HOST_EMAIL, HOST_PASSWORD)
        server.sendmail(HOST_EMAIL, username, message.as_string())
