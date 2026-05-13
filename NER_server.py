from gliner import GLiNER
from ray import serve
from starlette.requests import Request
import time


#To test the server, you can use the following curl command in a cmd terminal:
"""
curl -X POST http://127.0.0.1:8000 \
    -H "Content-Type: application/json" \
    -d '{"text": "Cristiano Ronaldo was born in 1985 and plays for Al Nassr", "labels": ["Person", "Date", "Teams"]}'
"""
@serve.deployment
class GLiNERServer:
    def __init__(self):
        """Initialize the GLiNER model (loaded once per deployment)"""
        print("Loading GLiNER model...")
        self.model = GLiNER.from_pretrained("urchade/gliner_medium-v2.1")
        print("Model loaded successfully")

    async def __call__(self, request: Request):
        """
        Handle incoming HTTP requests.

        Expects headers:
        - 'text': The text to perform NER on
        - 'labels': Labels for entity prediction (JSON array or comma-separated)
        """
        try:
            # Get text and labels request's body
            body = await request.json()

            text = body.get('text')
            labels_str = body.get('labels')

            if not text or not labels_str:
                return {
                    "error": "Missing fields in JSON body: 'text' and 'labels'",
                    "status": "failure"
                }

            # Parse labels
            if isinstance(labels_str, list):
                labels = labels_str
            elif isinstance(labels_str, str):
                # If string, split by comma and strip whitespace
                labels = [label.strip() for label in labels_str.split(',')]
            else:
                labels = [str(labels_str)]

            # Perform entity prediction
            entities = self.model.predict_entities(text, labels, threshold=0.5)

            # Format the response
            result = {
                "status": "success",
                "entities": entities,
                "entity_count": len(entities)
            }

            return result

        except Exception as e:
            return {
                "error": str(e),
                "status": "failure"
            }

# Deploy the model
if __name__ == "__main__":
    # Start Ray Serve with HTTP options and deploy the GLiNERServer.
    # Different Ray Serve versions expose different deployment APIs, so
    # try the modern `deploy()` first and fall back to bind+serve.run().
    serve.start(http_options={"host": "0.0.0.0", "port": 8000})
    deployed = False
    try:
        GLiNERServer.deploy()
        deployed = True
        print("GLiNERServer deployed via GLiNERServer.deploy() on http://0.0.0.0:8000")
    except AttributeError:
        # Older/newer Ray versions may require binding and running the deployment
        try:
            application = GLiNERServer.bind()
            serve.run(application)
            deployed = True
            print("GLiNERServer deployed via bind+serve.run() on http://0.0.0.0:8000")
        except TypeError as e:
            print("Failed to deploy via bind+serve.run():", e)
            print("Please check your Ray Serve version. You can still run this as a standalone ASGI app if needed.")

    # Keep the process alive so the Serve HTTP endpoint remains available.
    if deployed:
        print("Server is running. Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(3600)
        except KeyboardInterrupt:
            print("Shutting down GLiNER server...")