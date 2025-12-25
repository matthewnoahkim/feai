# Revolve Feature Testing Guide

## Quick Start Testing

### 1. Basic 360° Revolve (Cylinder)
**Steps:**
1. Create a new sketch on the Top plane
2. Draw a rectangle (e.g., 20x40 units) offset from the Y-axis (center at x=30)
3. Exit sketch
4. Click Revolve button in toolbar
5. Select the rectangle profile
6. Select Y-axis as revolve axis
7. Keep direction type as "Full (360°)"
8. Click Create

**Expected Result:** Hollow cylinder with rectangular cross-section

---

### 2. Partial Revolve (270° Arc)
**Steps:**
1. Create sketch on Top plane
2. Draw a circle (radius 10) at position (25, 0)
3. Exit sketch
4. Open Revolve dialog
5. Select circle profile
6. Select Y-axis
7. Change direction type to "One Direction"
8. Set angle to 270°
9. Click Create

**Expected Result:** 3/4 of a torus (donut shape)

---

### 3. Symmetric Revolve
**Steps:**
1. Create sketch
2. Draw a polygon (6 sides, radius 15) at position (30, 0)
3. Exit sketch
4. Open Revolve
5. Select polygon
6. Select Y-axis
7. Change to "Symmetric"
8. Set angle to 60° (will create ±60° = 120° total)
9. Click Create

**Expected Result:** 120° revolved hexagonal shape, symmetric about starting position

---

### 4. Two-Direction Revolve
**Steps:**
1. Create sketch
2. Draw rectangle at (25, 0)
3. Exit sketch
4. Open Revolve
5. Select profile
6. Select axis
7. Choose "One Direction"
8. Set angle to 180°
9. Set angle2 to 90°
10. Click Create

**Expected Result:** Asymmetric revolve: 180° in positive direction, 90° in negative direction (270° total)

---

### 5. Custom Axis from Sketch Line
**Steps:**
1. Create sketch
2. Draw a line from (0, 0) to (0, 50) - this will be the axis
3. Draw a circle at (20, 25) - this will be the profile
4. Exit sketch
5. Open Revolve
6. Select the circle as profile
7. In axis selector, find the line from the same sketch
8. Select it as the revolve axis
9. Keep Full 360°
10. Click Create

**Expected Result:** Torus revolved around the custom line axis

---

### 6. Surface Creation (Open Profile)
**Steps:**
1. Create sketch
2. Draw a single line from (15, -20) to (15, 20)
3. Exit sketch
4. Open Revolve
5. Select the line
6. Notice in summary: "Open profile - will create surface"
7. Select Y-axis
8. Full 360°
9. Click Create

**Expected Result:** Cylindrical surface (no end caps, hollow)

---

### 7. Boolean Operations - Add
**Steps:**
1. Create a rectangle, revolve 360° (creates first body)
2. Create a second sketch
3. Draw another shape overlapping the first
4. Revolve, but change Operation to "Add"
5. Click Create

**Expected Result:** 
- Preview shows in green
- Both shapes combined (visual representation)
- Operation tracked in feature parameters

---

### 8. Boolean Operations - Remove
**Steps:**
1. Have an existing revolved body
2. Create new sketch with shape that intersects
3. Revolve with Operation = "Remove"
4. Click Create

**Expected Result:**
- Preview shows in red
- Represents subtraction (visual)
- Operation tracked in parameters

---

### 9. Edge Case: Profile Near Axis
**Steps:**
1. Create rectangle very close to Y-axis (e.g., x=1)
2. Try to revolve around Y-axis
3. Notice warning in validation

**Expected Result:** Warning message about profile being close to axis, but still allows creation

---

### 10. Edge Case: Large Angle
**Steps:**
1. Create profile
2. Set one-direction angle to 400°
3. Observe warning in summary

**Expected Result:** System warns but allows >360° angles

---

## Validation Testing

### Test 1: Zero Angle
**Steps:** Try to revolve with angle = 0
**Expected:** Error message preventing creation

### Test 2: No Profile Selected
**Steps:** Open revolve dialog without selecting profile
**Expected:** Error message "Please select a profile to revolve"

### Test 3: Invalid Axis
**Steps:** Delete axis entity, try to revolve
**Expected:** Fallback to Y-axis

---

## Preview Testing

### Test Real-Time Updates
**Steps:**
1. Open revolve dialog with profile selected
2. Change angle slider
3. Watch preview update in real-time
4. Change axis selection
5. Watch preview reorient
6. Toggle between direction types
7. Watch preview adjust

**Expected:** Smooth, immediate preview updates for all changes

### Test Preview Colors
**Steps:**
1. Try each operation type (New, Add, Remove, Intersect)
2. Observe preview colors:
   - New: Purple
   - Add: Green
   - Remove: Red
   - Intersect: Purple

**Expected:** Preview color matches operation type

---

## Feature Tree Integration

### Test Feature Edit
**Steps:**
1. Create revolve feature
2. Right-click feature in tree
3. Select Edit
4. Change parameters
5. Click Create (updates existing)

**Expected:** Feature updates with new parameters

### Test Feature Suppression
**Steps:**
1. Create revolve
2. Right-click → Suppress
3. Observe geometry disappears
4. Right-click → Unsuppress

**Expected:** Feature can be toggled on/off

### Test Feature Rollback
**Steps:**
1. Create multiple features
2. Use rollback bar to roll back before revolve
3. Observe revolve disappears
4. Roll forward

**Expected:** Feature respects rollback state

---

## Performance Testing

### Test with High Segment Count
**Steps:**
1. Create complex profile
2. Revolve with full 360°
3. System should use 32 segments by default
4. Check preview renders smoothly

### Test with Partial Revolve
**Steps:**
1. Create profile
2. Revolve only 90°
3. System should adaptively reduce segment count
4. Verify faster generation

---

## Known Limitations to Verify

1. **Boolean Operations**: Currently visual only (no true CSG)
   - Confirm operations show different colors
   - Confirm parameters are saved
   - Note: actual geometry union/subtraction not yet implemented

2. **Thin Revolve**: UI exists but kernel implementation pending
   - Try setting thin revolve parameters
   - Note: feature creates but doesn't apply wall thickness yet

3. **Spline Profiles**: Basic support
   - Draw spline, try to revolve
   - Works but uses linear interpolation

---

## Troubleshooting

### Issue: Preview not showing
**Check:**
- Profile is selected
- Axis is valid
- "Show preview" checkbox is enabled
- Angle is non-zero

### Issue: Feature fails to create
**Check:**
- Sketch is closed/exited
- Profile is valid geometry
- Angle is non-zero
- No linter errors in console

### Issue: Axis not working
**Check:**
- Line entity exists in sketch
- Line has length > 0
- Falls back to Y-axis if invalid

---

## Advanced Testing

### Test Parametric Update
**Steps:**
1. Create revolve feature
2. Edit source sketch
3. Modify profile dimensions
4. Exit sketch
5. Watch feature regenerate

**Expected:** Revolve updates to match new profile

### Test Multiple Revolves
**Steps:**
1. Create first revolve
2. Create second revolve on different sketch
3. Both should coexist
4. Try boolean operations between them

**Expected:** Multiple independent revolve features work together

---

## Success Criteria Checklist

- [ ] Can create basic 360° revolve
- [ ] Can create partial revolve (custom angle)
- [ ] Can create symmetric revolve
- [ ] Can create two-direction revolve
- [ ] Can select reference axes (X, Y, Z)
- [ ] Can select sketch line as custom axis
- [ ] Preview updates in real-time
- [ ] Preview shows correct operation colors
- [ ] Can edit existing revolve feature
- [ ] Feature regenerates on sketch changes
- [ ] Validation catches invalid inputs
- [ ] Warning shows for edge cases
- [ ] Surface creation works with line profiles
- [ ] Solid creation works with closed profiles
- [ ] Feature tree integration works
- [ ] Suppression/unsuppression works
- [ ] Rollback respects revolve features

---

## Report Issues

If you encounter issues not covered in "Known Limitations", please note:
1. Steps to reproduce
2. Expected vs actual result
3. Console errors (if any)
4. Screenshots of geometry

