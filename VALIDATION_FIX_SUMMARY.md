# Complaint Form Validation Fix Summary

## Problem

The complaint form was allowing submission when India was selected as the country without requiring a state/territory selection.

## Root Causes

### 1. **Backend Issue** (CRITICAL)

**File:** `/src/app/api/complaints/route.js`

**Problem:** The backend was automatically creating a "Default Territory" for ANY country (including India) when no territory was provided. This meant:

- User selects India
- User doesn't select a state
- Frontend validation passes (correctly shows error)
- BUT if somehow submitted, backend would auto-create a territory and accept it

**Lines 238-283:** The code was creating default territories for all countries without checking if it's India.

### 2. **Frontend Issue** (MINOR)

**File:** `complaint.html` (WordPress form)

**Problem:** There was orphaned validation code at lines 8-36 that would run BEFORE the DOM was loaded, causing potential errors.

## Fixes Applied

### ✅ Backend Fix (`route.js`)

Added validation at line 248-260:

```javascript
// ✅ VALIDATION: If country is India, territory_id is MANDATORY
const isIndia =
  countryExists.countryName &&
  countryExists.countryName.toLowerCase() === "india";

if (isIndia) {
  console.log("❌ ERROR: India selected but no territory/state provided");
  return NextResponse.json(
    {
      error: "State/Territory is required for India. Please select a state.",
      field: "territory_id",
    },
    { status: 400, headers: corsHeaders },
  );
}
```

**What this does:**

1. Checks if the selected country is "India"
2. If India is selected AND no territory_id is provided, it **rejects** the request
3. Returns a clear error message to the frontend
4. Prevents automatic territory creation for India

### ✅ Frontend Fix (`complaint_form_fixed.html`)

1. **Removed orphaned validation code** (lines 8-36 in original)
2. **Kept existing validation logic** (lines 786-795) which correctly validates:

   ```javascript
   // Country is always required
   if (!data.country_id) {
     $("#location-error").text("Please select a country");
     isValid = false;
   }

   // State required only for India
   if (
     $("#location option:selected").text() === "India" &&
     !data.territory_id
   ) {
     $("#states-error").text("Please select a state for India");
     isValid = false;
   }
   ```

3. **Added file size validation** for images (18MB) and videos (30MB)

## How It Works Now

### For India:

1. User selects "India" from country dropdown
2. State dropdown appears (automatically fetched from API)
3. User **MUST** select a state
4. If user tries to submit without selecting state:
   - ❌ Frontend shows error: "Please select a state for India"
   - ❌ Backend rejects with: "State/Territory is required for India. Please select a state."

### For Other Countries:

1. User selects any other country
2. State dropdown is hidden (not required)
3. Form can be submitted without state
4. Backend automatically creates a "Default Territory - [Country Name]" if needed

## Testing Checklist

- [ ] Select India → State dropdown appears
- [ ] Select India → Try submit without state → Error shown
- [ ] Select India → Select state → Submit → Success
- [ ] Select USA → State dropdown hidden
- [ ] Select USA → Submit → Success (auto-creates default territory)
- [ ] Select any other country → Submit → Success

## Files Modified

1. ✅ `/src/app/api/complaints/route.js` - Added India validation
2. ✅ `/complaint_form_fixed.html` - Cleaned up validation code

## Deployment Notes

1. Replace the current WordPress form HTML with `complaint_form_fixed.html`
2. The backend changes are already applied to `route.js`
3. Test thoroughly with both India and non-India countries
4. Monitor backend logs for the validation messages

## Error Messages

### Frontend Errors:

- "Please select a country" - No country selected
- "Please select a state for India" - India selected but no state

### Backend Errors:

- "State/Territory is required for India. Please select a state." - India selected but no territory_id in request

---

**Fixed by:** Antigravity AI
**Date:** 2026-02-16
**Issue:** Country/State validation not working properly
