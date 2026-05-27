"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlots = generateSlots;
exports.listSlots = listSlots;
exports.blockSlot = blockSlot;
exports.updateSlot = updateSlot;
exports.deleteSlot = deleteSlot;
const zod_1 = require("zod");
const roles_1 = require("../constants/roles");
const Resource_1 = require("../models/Resource");
const Slot_1 = require("../models/Slot");
const User_1 = require("../models/User");
const slot_service_1 = require("../services/slot.service");
const env_1 = require("../config/env");
const time_1 = require("../utils/time");
const generateSchema = zod_1.z.object({
    resourceId: zod_1.z.string(),
    date: zod_1.z.string(),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
    durationMinutes: zod_1.z.number().min(15).max(240),
});
const blockSlotSchema = zod_1.z.object({
    slotId: zod_1.z.string(),
    reason: zod_1.z.string().min(2).max(100).optional(),
});
const updateSlotSchema = zod_1.z.object({
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
    status: zod_1.z.enum(["available", "blocked"]).optional(),
    pricePerHour: zod_1.z.number().nonnegative().optional(),
});
async function verifyResourceOwnership(req, resourceId) {
    const resource = await Resource_1.ResourceModel.findById(resourceId);
    if (!resource) {
        return { ok: false, status: 404, message: "Resource not found" };
    }
    if (req.user.role === roles_1.ROLES.ADMIN) {
        return { ok: true, resource };
    }
    if (req.user.role === roles_1.ROLES.OWNER) {
        if (String(resource.ownerId) !== req.user.id) {
            return { ok: false, status: 403, message: "You do not own this resource" };
        }
        return { ok: true, resource };
    }
    if (req.user.role === roles_1.ROLES.STAFF) {
        const staffUser = await User_1.UserModel.findById(req.user.id);
        if (!staffUser?.ownerId || String(resource.ownerId) !== String(staffUser.ownerId)) {
            return { ok: false, status: 403, message: "You do not have access to this resource" };
        }
        return { ok: true, resource };
    }
    return { ok: false, status: 403, message: "Insufficient permissions" };
}
async function generateSlots(req, res) {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: parsed.error.flatten() });
        return;
    }
    const ownership = await verifyResourceOwnership(req, parsed.data.resourceId);
    if (!ownership.ok) {
        res.status(ownership.status).json({ message: ownership.message });
        return;
    }
    const createdCount = await (0, slot_service_1.generateDailySlots)(parsed.data);
    res.status(201).json({ createdCount });
}
async function listSlots(req, res) {
    const resourceId = String(req.query.resourceId ?? "");
    const date = String(req.query.date ?? "");
    if (!resourceId || !date) {
        res.status(400).json({ message: "resourceId and date are required" });
        return;
    }
    const slots = await Slot_1.SlotModel.find({ resourceId, date }).sort({ startTime: 1 });
    const timezone = env_1.env.APP_TIMEZONE;
    const visibleSlots = slots.filter((slot) => !(0, time_1.isSlotPast)(date, slot.startTime, timezone));
    res.json(visibleSlots);
}
async function blockSlot(req, res) {
    const parsed = blockSlotSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: parsed.error.flatten() });
        return;
    }
    const slot = await Slot_1.SlotModel.findOneAndUpdate({ _id: parsed.data.slotId, status: { $in: ["available", "blocked"] } }, {
        $set: {
            status: "blocked",
            blockedReason: parsed.data.reason ?? "Blocked by owner/staff",
        },
    }, { new: true });
    if (!slot) {
        res.status(404).json({ message: "Slot not found or already booked" });
        return;
    }
    res.json(slot);
}
async function updateSlot(req, res) {
    const parsed = updateSlotSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: parsed.error.flatten() });
        return;
    }
    const slot = await Slot_1.SlotModel.findById(req.params.slotId);
    if (!slot) {
        res.status(404).json({ message: "Slot not found" });
        return;
    }
    const ownership = await verifyResourceOwnership(req, String(slot.resourceId));
    if (!ownership.ok) {
        res.status(ownership.status).json({ message: ownership.message });
        return;
    }
    if (slot.status === "booked") {
        res.status(400).json({ message: "Booked slot cannot be edited" });
        return;
    }
    slot.startTime = parsed.data.startTime;
    slot.endTime = parsed.data.endTime;
    if (parsed.data.status) {
        slot.status = parsed.data.status;
        if (parsed.data.status !== "blocked") {
            slot.blockedReason = undefined;
        }
    }
    if (typeof parsed.data.pricePerHour === "number") {
        slot.pricePerHour = parsed.data.pricePerHour;
    }
    try {
        await slot.save();
    }
    catch {
        res.status(409).json({ message: "Slot time conflict for this date/resource" });
        return;
    }
    res.json({ message: "Slot updated", slot });
}
async function deleteSlot(req, res) {
    const slot = await Slot_1.SlotModel.findById(req.params.slotId);
    if (!slot) {
        res.status(404).json({ message: "Slot not found" });
        return;
    }
    const ownership = await verifyResourceOwnership(req, String(slot.resourceId));
    if (!ownership.ok) {
        res.status(ownership.status).json({ message: ownership.message });
        return;
    }
    if (slot.status === "booked") {
        res.status(400).json({ message: "Booked slot cannot be deleted" });
        return;
    }
    await Slot_1.SlotModel.deleteOne({ _id: slot._id });
    res.json({ message: "Slot deleted successfully" });
}
async function updateSlot(req, res) {
    const parsed = updateSlotSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: parsed.error.flatten() });
        return;
    }
    const slot = await Slot_1.SlotModel.findById(req.params.slotId);
    if (!slot) {
        res.status(404).json({ message: "Slot not found" });
        return;
    }
    const ownership = await verifyResourceOwnership(req, String(slot.resourceId));
    if (!ownership.ok) {
        res.status(ownership.status).json({ message: ownership.message });
        return;
    }
    if (slot.status === "booked") {
        res.status(400).json({ message: "Booked slot cannot be edited" });
        return;
    }
    slot.startTime = parsed.data.startTime;
    slot.endTime = parsed.data.endTime;
    if (parsed.data.status) {
        slot.status = parsed.data.status;
        if (parsed.data.status !== "blocked") {
            slot.blockedReason = undefined;
        }
    }
    if (typeof parsed.data.pricePerHour === "number") {
        slot.pricePerHour = parsed.data.pricePerHour;
    }
    try {
        await slot.save();
    }
    catch {
        res.status(409).json({ message: "Slot time conflict for this date/resource" });
        return;
    }
    res.json({ message: "Slot updated", slot });
}
async function deleteSlot(req, res) {
    const slot = await Slot_1.SlotModel.findById(req.params.slotId);
    if (!slot) {
        res.status(404).json({ message: "Slot not found" });
        return;
    }
    const ownership = await verifyResourceOwnership(req, String(slot.resourceId));
    if (!ownership.ok) {
        res.status(ownership.status).json({ message: ownership.message });
        return;
    }
    if (slot.status === "booked") {
        res.status(400).json({ message: "Booked slot cannot be deleted" });
        return;
    }
    await Slot_1.SlotModel.deleteOne({ _id: slot._id });
    res.json({ message: "Slot deleted successfully" });
}
