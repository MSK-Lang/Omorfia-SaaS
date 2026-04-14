from pydantic import BaseModel, Field
from typing import List, Optional

class ClinicConfig(BaseModel):
    """
    Architectural model for B2B Clinic configuration.
    Ensures multi-tenancy isolation and regional financial compliance.
    """
    clinic_id: str = Field(..., description="Unique UUID or slug identifying the partner clinic.")
    name: str = Field(..., description="Legal name of the clinical establishment.")
    currency: str = Field("USD", description="ISO 4217 currency code for revenue calculations.")
    commission_rate: float = Field(..., description="Percentage rate (0.0-1.0) the agency takes per booking.")

class AnalysisRequest(BaseModel):
    """
    Contract for incoming diagnostic requests.
    Enforces stateless processing as per Omorfia Scalable Fortress Laws.
    """
    image_data: str = Field(..., description="Base64 encoded string of the patient's facial image.")
    user_email: str = Field(..., description="Email of the patient for reporting and lead tracking.")
    clinic_id: str = Field(..., description="The ID of the clinic initiating the request for multi-tenant isolation.")

class SkinMetrics(BaseModel):
    """
    The 15-point clinical diagnostic matrix.
    Captures the physical and biological state of the dermal layers.
    All values are normalized floats (typically 0.0 - 100.0).
    """
    texture: float = Field(..., description="Surface smoothness and micro-relief uniformity.")
    pore_density: float = Field(..., description="Concentration and visibility of follicular openings.")
    redness: float = Field(..., description="Vascular reactivity and inflammation index.")
    pigmentation: float = Field(..., description="Melanin distribution and localized hyperpigmentation.")
    sebum_level: float = Field(..., description="Lipid production and surface oiliness measurement.")
    glow_score: float = Field(..., description="Luminosity and light-reflection capacity of the skin.")
    blemish_severity: float = Field(..., description="Presence and intensity of acneic or inflammatory lesions.")
    dark_circle_index: float = Field(..., description="Periorbital hyperpigmentation and vascular congestion.")
    wrinkle_index: float = Field(..., description="Depth and frequency of structural folding and lines.")
    uv_damage: float = Field(..., description="Sub-epidermal photo-aging and sun-induced cellular damage.")
    roughness: float = Field(..., description="Macro-texture irregularities and desquamation levels.")
    tone_uniformity: float = Field(..., description="Consistency of skin color across the diagnostic frame.")
    firmness_index: float = Field(..., description="Dermal density and resistance to mechanical deformation.")
    sagging_score: float = Field(..., description="Ptosis level and gravitational impact on facial contours.")
    elasticity: float = Field(..., description="Recoil capacity and extracellular matrix resilience.")

class AnalysisResponse(BaseModel):
    """
    The 'Revenue Output' contract.
    Contains the biological insights required to generate treatment plans.
    """
    lead_id: str = Field(..., description="Tracking ID for the CRM/Agency conversion pipeline.")
    skin_age: int = Field(..., description="Calculated biological age based on weighted metrics.")
    metrics: SkinMetrics = Field(..., description="The full 15-point diagnostic breakdown.")
    status: str = Field(..., description="Operation status (e.g., 'success', 'error').")

class AgencyTreatment(BaseModel):
    """
    B2B Agency logic model.
    Maps clinical deficiencies to high-value revenue opportunities.
    """
    service_name: str = Field(..., description="The name of the recommended aesthetic procedure.")
    recommended_sessions: int = Field(..., description="The number of sessions required for optimal clinical outcome.")
    estimated_revenue: float = Field(..., description="Projected financial value for the clinic in local currency.")
