import pytest
from unittest.mock import patch, AsyncMock
from app.services.hindsight_service import HindsightService
from app.config import settings

@pytest.mark.asyncio
async def test_hindsight_unconfigured():
    """Verify that HindsightService safely reports unconfigured status when keys are missing."""
    service = HindsightService()
    res = await service.health_check()
    assert res["connected"] is False
    assert res["status"] in ("not_configured", "error")

@pytest.mark.asyncio
async def test_hindsight_retain_unconfigured_error():
    """Verify retain_memory raises a clear error when Hindsight is not configured."""
    service = HindsightService()
    with pytest.raises(RuntimeError, match="Hindsight is not configured"):
        await service.retain_memory("ws-123", "Sample content")

@pytest.mark.asyncio
async def test_hindsight_health_check_mock_success():
    """Verify health check parses valid 200 response from Hindsight Cloud."""
    service = HindsightService()
    service.api_key = "test_key"
    service.bank_id = "test_bank"
    
    with patch("httpx.AsyncClient.get") as mock_get:
        # Mock health/ready and stats responses
        mock_resp = AsyncMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"bank_id": "test_bank", "memory_count": 42}
        mock_get.return_value = mock_resp

        with patch.object(settings, "HINDSIGHT_API_KEY", "test_key_long_enough"), \
             patch.object(settings, "HINDSIGHT_BANK_ID", "test_bank"):
            res = await service.health_check()
            assert res["connected"] is True
            assert res["status"] == "connected"
            assert res["bank_id"] == "test_bank"
