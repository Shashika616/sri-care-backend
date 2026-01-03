# 📢 Sri-Care Notification Service

This is the **Notification Microservice** for the Sri-Care Telecommunication platform. 
It is designed as an **Event-Driven, Asynchronous** system responsible for delivering high-volume alerts (Email & SMS) to customers without blocking core billing or provisioning operations.

---

## 🏗 Architecture

The service follows the **Queue-Based Load Leveling** pattern to ensure "Best Effort" delivery:

1.  **Event Ingestion:** Listens to `RabbitMQ` for domain events (e.g., `billing.generated`, `payment.success`).
2.  **Decoupling:** Immediately acknowledges the event to prevent blocking upstream services.
3.  **Queuing:** Pushes the notification task to a `Redis Queue` (Bull).
4.  **Processing:** A background **Worker** picks up the job and processes it.
5.  **Delivery:** Connects to external providers (Twilio / Gmail) to send the message.
6.  **Audit:** Logs the status (SENT/FAILED) to `MongoDB`.

```mermaid
graph LR
    A[Billing Service] -- Event --> B(RabbitMQ)
    B -- Consume --> C[Notification Service]
    C -- Enqueue --> D[(Redis Queue)]
    D -- Process --> E[Worker]
    E -- Send --> F{External APIs}
    F -- Email --> G[Gmail / SMTP]
    F -- SMS --> H[Twilio]
    E -- Log --> I[(MongoDB)]