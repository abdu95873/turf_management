"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailySlots = generateDailySlots;
const Slot_1 = require("../models/Slot");
const Resource_1 = require("../models/Resource");
const time_1 = require("../utils/time");
async function generateDailySlots(input) {
    const { resourceId, date, startTime, endTime, durationMinutes } = input;
    const startMinutes = (0, time_1.toMinutes)(startTime);
    const endMinutes = (0, time_1.toMinutes)(endTime);
    if (endMinutes <= startMinutes || durationMinutes <= 0) {
        throw new Error("Invalid slot range or duration");
    }
    const resource = await Resource_1.ResourceModel.findById(resourceId).select("pricePerHour");
    const slotPrice = resource?.pricePerHour;
    const bulk = [];
    for (let current = startMinutes; current + durationMinutes <= endMinutes; current += durationMinutes) {
        const slotStart = `${Math.floor(current / 60).toString().padStart(2, "0")}:${(current % 60)
            .toString()
            .padStart(2, "0")}`;
        const slotEnd = (0, time_1.addMinutes)(slotStart, durationMinutes);
        bulk.push({
            updateOne: {
                filter: { resourceId, date, startTime: slotStart },
                update: {
                    $setOnInsert: {
                        resourceId,
                        date,
                        startTime: slotStart,
                        endTime: slotEnd,
                        pricePerHour: slotPrice,
                        status: "available",
                        generatedByRule: true,
                    },
                },
                upsert: true,
            },
        });
    }
    if (bulk.length === 0) {
        return 0;
    }
    const result = await Slot_1.SlotModel.bulkWrite(bulk, { ordered: false });
    return result.upsertedCount ?? 0;
}
