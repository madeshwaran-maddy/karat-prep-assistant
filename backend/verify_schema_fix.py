import sys
import types

sys.path.insert(0, r"d:\Karat\karat-prep-assistant\backend")

# Stub optional third-party modules so the backend can be imported in isolation.
dotenv = types.ModuleType("dotenv")
dotenv.load_dotenv = lambda *args, **kwargs: None
sys.modules["dotenv"] = dotenv

httpx = types.ModuleType("httpx")
httpx.Client = object
httpx.AsyncClient = object
sys.modules["httpx"] = httpx

ollama_mod = types.ModuleType("ollama")
ollama_mod.chat = lambda *args, **kwargs: {"message": {"content": "ok"}}
sys.modules["ollama"] = ollama_mod

# Stub modules that are imported during app startup but are not needed for schema repair.
debugging_pkg = types.ModuleType("debugging_drill")
api_pkg = types.ModuleType("debugging_drill.api")
api_pkg.router = object()
sys.modules["debugging_drill"] = debugging_pkg
sys.modules["debugging_drill.api"] = api_pkg

service_pkg = types.ModuleType("debugging_drill.services")
ollama_service_mod = types.ModuleType("debugging_drill.services.ollama_service")
class OllamaService:
    def health(self):
        return True
    def available_models(self):
        return []
ollama_service_mod.OllamaService = OllamaService
sys.modules["debugging_drill.services"] = service_pkg
sys.modules["debugging_drill.services.ollama_service"] = ollama_service_mod

mock_pkg = types.ModuleType("mock_assessment")
mock_api_pkg = types.ModuleType("mock_assessment.api")
mock_api_pkg.router = object()
mock_svc_pkg = types.ModuleType("mock_assessment.services")
excel_mod = types.ModuleType("mock_assessment.services.excel_service")
excel_mod.get_random_exercise_question = lambda *args, **kwargs: None
sys.modules["mock_assessment"] = mock_pkg
sys.modules["mock_assessment.api"] = mock_api_pkg
sys.modules["mock_assessment.services"] = mock_svc_pkg
sys.modules["mock_assessment.services.excel_service"] = excel_mod

concept_pkg = types.ModuleType("concept_learning")
concept_routes = types.ModuleType("concept_learning.routes")
concept_routes.router = object()
sys.modules["concept_learning"] = concept_pkg
sys.modules["concept_learning.routes"] = concept_routes

practice_pkg = types.ModuleType("practice_question_tracking")
practice_routes = types.ModuleType("practice_question_tracking.routes")
practice_routes.router = object()
sys.modules["practice_question_tracking"] = practice_pkg
sys.modules["practice_question_tracking.routes"] = practice_routes

import main

class FakeResult:
    def __init__(self, rows=None):
        self._rows = rows or []
    def scalar(self):
        return self._rows[0][0] if self._rows else False

class FakeConnection:
    def __init__(self):
        self.calls = []
    def execute(self, query, params=None):
        q = str(query).lower()
        self.calls.append(q)
        if "information_schema.tables" in q and "candidates" in q:
            return FakeResult([(False,)])
        return FakeResult([])
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_value, traceback):
        return False

fake = FakeConnection()
orig_begin = main.engine.begin
main.engine.begin = lambda: fake
try:
    main.ensure_schema()
    print("DROP_PRACTICE_PROGRESS", any("drop table if exists practice_question_progress" in c for c in fake.calls))
    print("CREATE_CANDIDATES", any("create table if not exists candidates" in c for c in fake.calls))
    print("VERIFICATION_OK")
finally:
    main.engine.begin = orig_begin
