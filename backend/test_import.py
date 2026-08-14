import sys
import traceback

sys.path.insert(0, '.')

try:
    from mock_assessment.services.assessment_service import generate_round1_questions
    print('✓ Import successful')
except Exception as e:
    print(f'✗ Import error: {e}')
    traceback.print_exc()
