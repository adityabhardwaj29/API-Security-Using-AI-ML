import time
from collections import defaultdict
from threading import Lock
from typing import Dict, List, Tuple


class SlidingWindowRateLimiter:
    def __init__(self, default_limit: int = 120, window_seconds: int = 60):
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)
        self.lock = Lock()

    def is_allowed(self, key: str, custom_limit: int = None) -> Tuple[bool, int, int]:
        limit = custom_limit if custom_limit is not None else self.default_limit
        now = time.time()
        cutoff = now - self.window_seconds

        with self.lock:
            # Clean old timestamps
            self.requests[key] = [t for t in self.requests[key] if t > cutoff]
            current_count = len(self.requests[key])

            if current_count < limit:
                self.requests[key].append(now)
                return True, current_count + 1, limit
            else:
                return False, current_count, limit

    def get_velocity(self, key: str, window_seconds: int = 60) -> int:
        now = time.time()
        cutoff = now - window_seconds
        with self.lock:
            recent = [t for t in self.requests[key] if t > cutoff]
            return len(recent)


rate_limiter = SlidingWindowRateLimiter(default_limit=150, window_seconds=60)
