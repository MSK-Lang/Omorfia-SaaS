OMORFIA SCALABLE FORTRESS LAWS
Domain Isolation: Code in /backend/engine (The Brain) must be stateless and must NEVER import PDF, UI, or Database libraries.

Multi-Tenancy: Every request, database record, and report must be keyed by clinic_id. Data must be siloed.

Contract First: All data exchange between modules (Frontend <-> API <-> Engine) must strictly follow Pydantic schemas in backend/api/schemas.py.

Scalability: Process images in-memory (Bytes/Base64). Do not save temp files to disk.

Agency Logic: The system's goal is to produce 'Revenue Outputs' (Treatment Plans, Bookings), not just data points.
