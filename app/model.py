from transformers import pipeline

class SummarizerModel:
    def __init__(self):
        print("Loading models...")

        # Fast (lightweight)
        self.fast_model = pipeline(
            "summarization",
            model="t5-small"
        )

        # Balanced (default)
        self.medium_model = pipeline(
            "summarization",
            model="facebook/bart-large-cnn"
        )

        # Accurate (heavy, best quality)
        self.quality_model = pipeline(
            "summarization",
            model="google/pegasus-xsum"
        )

    def summarize(self, text, mode="balanced"):

        if mode == "fast":
            return self._run(self.fast_model, text, 30, 10)

        elif mode == "accurate":
            return self._run(self.quality_model, text, 120, 40)

        else:  # balanced
            return self._run(self.medium_model, text, 80, 30)

    def _run(self, model, text, max_len, min_len):
        result = model(
            text,
            max_length=max_len,
            min_length=min_len,
            do_sample=False
        )
        return result[0]["summary_text"]


model_instance = SummarizerModel()
