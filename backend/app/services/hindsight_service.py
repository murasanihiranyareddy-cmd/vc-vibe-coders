import logging
import time
import uuid
import httpx
from typing import Dict, Any, List, Optional
from ..config import settings

logger = logging.getLogger("vc.hindsight")

class HindsightService:
    """
    Official Hindsight Cloud client service.
    Handles semantic memory retention, recall, and reflection via Hindsight Cloud REST API.
    Base URL: https://api.hindsight.vectorize.io
    """
    def __init__(self):
        self.base_url = settings.HINDSIGHT_BASE_URL.rstrip("/")
        self.api_key = settings.HINDSIGHT_API_KEY
        self.bank_id = settings.HINDSIGHT_BANK_ID
        self.timeout = 20.0

    def _get_headers(self) -> Dict[str, str]:
        if not self.api_key:
            raise ValueError("Hindsight API key is not configured.")
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "VC-Team-Memory/1.0",
            "X-Request-ID": str(uuid.uuid4())
        }

    async def health_check(self) -> Dict[str, Any]:
        """Verify connectivity to Hindsight Cloud API and report actual status."""
        req_id = str(uuid.uuid4())
        if not settings.is_hindsight_configured:
            return {
                "status": "not_configured",
                "connected": False,
                "message": "Hindsight API key or Bank ID not configured in environment.",
                "bank_id": self.bank_id or "not_set",
                "is_live": False
            }

        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # 1. Check API health endpoint
                health_url = f"{self.base_url}/health/ready"
                resp = await client.get(health_url)
                
                # 2. Check Bank existence and stats
                bank_stats_url = f"{self.base_url}/v1/default/banks/{self.bank_id}/stats"
                bank_resp = await client.get(bank_stats_url, headers=self._get_headers())
                
                elapsed_ms = round((time.time() - start_time) * 1000, 2)

                if bank_resp.status_code == 200:
                    stats_data = bank_resp.json()
                    return {
                        "status": "connected",
                        "connected": True,
                        "status_code": bank_resp.status_code,
                        "latency_ms": elapsed_ms,
                        "bank_id": self.bank_id,
                        "stats": stats_data,
                        "is_live": True,
                        "message": f"Successfully connected to Hindsight Bank '{self.bank_id}' in {elapsed_ms}ms"
                    }
                elif bank_resp.status_code in (401, 403):
                    return {
                        "status": "error",
                        "connected": False,
                        "status_code": bank_resp.status_code,
                        "latency_ms": elapsed_ms,
                        "bank_id": self.bank_id,
                        "is_live": True,
                        "message": "Invalid Hindsight API Key or unauthorized access to bank."
                    }
                elif bank_resp.status_code == 404:
                    return {
                        "status": "error",
                        "connected": False,
                        "status_code": 404,
                        "latency_ms": elapsed_ms,
                        "bank_id": self.bank_id,
                        "is_live": True,
                        "message": f"Bank ID '{self.bank_id}' was not found in Hindsight Cloud."
                    }
                else:
                    return {
                        "status": "error",
                        "connected": False,
                        "status_code": bank_resp.status_code,
                        "latency_ms": elapsed_ms,
                        "bank_id": self.bank_id,
                        "is_live": True,
                        "message": f"Hindsight returned unexpected status code {bank_resp.status_code}"
                    }
        except httpx.ConnectTimeout:
            return {
                "status": "timeout",
                "connected": False,
                "message": f"Connection timed out after {self.timeout}s connecting to Hindsight Cloud.",
                "bank_id": self.bank_id,
                "is_live": False
            }
        except Exception as e:
            logger.error(f"[Req {req_id}] Hindsight health check error: {str(e)}")
            return {
                "status": "error",
                "connected": False,
                "message": f"Failed to connect to Hindsight Cloud: {str(e)}",
                "bank_id": self.bank_id,
                "is_live": False
            }

    async def retain_memory(
        self,
        workspace_id: str,
        content: str,
        title: Optional[str] = None,
        tags: Optional[List[str]] = None,
        source: str = "manual",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Retain memory item in Hindsight Cloud.
        POST /v1/default/banks/{bank_id}/memories
        """
        if not settings.is_hindsight_configured:
            raise RuntimeError("Hindsight is not configured. Use demo memory engine in DEMO_MODE.")

        url = f"{self.base_url}/v1/default/banks/{self.bank_id}/memories"
        
        # Prepare context metadata
        context_payload: Dict[str, Any] = {
            "workspace_id": workspace_id,
            "source": source,
            "retained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        if title:
            context_payload["title"] = title
        if tags:
            context_payload["tags"] = tags
        if metadata:
            context_payload.update(metadata)

        payload = {
            "content": content,
            "context": context_payload
        }

        req_id = str(uuid.uuid4())
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, headers=self._get_headers(), json=payload)
                if response.status_code in (200, 201):
                    data = response.json()
                    logger.info(f"[Req {req_id}] Retained memory in Hindsight bank {self.bank_id}")
                    return {
                        "success": True,
                        "status": "retained",
                        "external_id": data.get("id") or data.get("memory_id") or str(uuid.uuid4()),
                        "raw_response": data
                    }
                else:
                    logger.error(f"[Req {req_id}] Retain failed with status {response.status_code}: {response.text}")
                    return {
                        "success": False,
                        "status": "failed",
                        "error": f"Hindsight API returned {response.status_code}: {response.text}"
                    }
        except Exception as e:
            logger.error(f"[Req {req_id}] Retain memory exception: {str(e)}")
            return {
                "success": False,
                "status": "failed",
                "error": str(e)
            }

    async def recall_memory(
        self,
        query: str,
        workspace_id: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Recall relevant memories from Hindsight Cloud.
        POST /v1/default/banks/{bank_id}/memories/recall
        """
        if not settings.is_hindsight_configured:
            return []

        url = f"{self.base_url}/v1/default/banks/{self.bank_id}/memories/recall"
        payload = {
            "query": query,
            "limit": limit,
            "filter": {
                "workspace_id": workspace_id
            }
        }

        req_id = str(uuid.uuid4())
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, headers=self._get_headers(), json=payload)
                if response.status_code == 200:
                    data = response.json()
                    # Parse items from response
                    items = data.get("memories") or data.get("results") or data.get("data") or []
                    return items
                else:
                    logger.warning(f"[Req {req_id}] Recall returned status {response.status_code}")
                    return []
        except Exception as e:
            logger.error(f"[Req {req_id}] Recall memory exception: {str(e)}")
            return []

    async def reflect_memory(
        self,
        query: str,
        workspace_id: str,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Use Hindsight Cloud reflect endpoint to formulate a grounded answer.
        POST /v1/default/banks/{bank_id}/reflect
        """
        if not settings.is_hindsight_configured:
            raise RuntimeError("Hindsight is not configured.")

        url = f"{self.base_url}/v1/default/banks/{self.bank_id}/reflect"
        payload: Dict[str, Any] = {
            "query": query,
            "filter": {
                "workspace_id": workspace_id
            }
        }
        if context:
            payload["context"] = context

        req_id = str(uuid.uuid4())
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, headers=self._get_headers(), json=payload)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "answer": data.get("answer") or data.get("text") or data.get("content") or "No answer returned.",
                        "based_on": data.get("based_on") or data.get("sources") or data.get("evidence") or [],
                        "confidence": data.get("confidence", 1.0)
                    }
                else:
                    logger.error(f"[Req {req_id}] Reflect returned status {response.status_code}: {response.text}")
                    return {
                        "success": False,
                        "error": f"Hindsight reflect returned {response.status_code}: {response.text}",
                        "answer": "Unable to formulate answer via Hindsight Cloud reflect at this time."
                    }
        except Exception as e:
            logger.error(f"[Req {req_id}] Reflect exception: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "answer": "An error occurred while connecting to Hindsight Cloud."
            }

hindsight_service = HindsightService()
