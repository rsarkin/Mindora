"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountStatus = exports.UserRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var UserRole;
(function (UserRole) {
    UserRole["PATIENT"] = "PATIENT";
    UserRole["THERAPIST"] = "THERAPIST";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["DEACTIVATED"] = "DEACTIVATED";
    AccountStatus["PENDING_VERIFICATION"] = "PENDING_VERIFICATION";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    name: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.PATIENT },
    accountStatus: { type: String, enum: Object.values(AccountStatus), default: AccountStatus.ACTIVE },
    googleId: { type: String, unique: true, sparse: true },
    appleId: { type: String, unique: true, sparse: true },
    dateOfBirth: { type: Date },
    gender: { type: String },
    location: { type: String },
    emergencyContact: { type: mongoose_1.Schema.Types.Mixed },
    consentedAt: { type: Date },
    dataRetentionDays: { type: Number, default: 2555 },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date }
}, {
    timestamps: true
});
UserSchema.pre('findOneAndDelete', async function (next) {
    const docToDelete = await this.model.findOne(this.getQuery());
    if (docToDelete) {
        if (docToDelete.role === UserRole.THERAPIST) {
            await mongoose_1.default.model('Therapist').findOneAndDelete({ userId: docToDelete._id });
        }
        await mongoose_1.default.model('Appointment').deleteMany({ patientId: docToDelete._id });
    }
    next();
});
exports.default = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map