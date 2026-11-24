from django.urls import path
from .views import (
    AnalyzeResumeView,
    CandidateRecommendationsView,
    ResumeAnalysisHistoryView,
    AIAgentChatView,
    AIAgentPromptsView
)

urlpatterns = [
    path('analyze-resume/', AnalyzeResumeView.as_view(), name='analyze_resume'),
    path('recommendations/', CandidateRecommendationsView.as_view(), name='candidate_recommendations'),
    path('history/', ResumeAnalysisHistoryView.as_view(), name='resume_analysis_history'),

    # AI Agent Copilot endpoints
    path('agent/chat/', AIAgentChatView.as_view(), name='ai_agent_chat'),
    path('agent/prompts/', AIAgentPromptsView.as_view(), name='ai_agent_prompts'),
]
