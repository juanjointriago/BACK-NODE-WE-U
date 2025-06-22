"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeASC = exports.UserRoles = void 0;
var UserRoles;
(function (UserRoles) {
    UserRoles[UserRoles["Superadmin"] = 1] = "Superadmin";
    UserRoles[UserRoles["SubAdmin"] = 2] = "SubAdmin";
    UserRoles[UserRoles["ASC"] = 3] = "ASC";
    UserRoles[UserRoles["User"] = 4] = "User";
    UserRoles[UserRoles["Subscriber"] = 5] = "Subscriber";
})(UserRoles || (exports.UserRoles = UserRoles = {}));
var typeASC;
(function (typeASC) {
    typeASC[typeASC["PUBLIC"] = 1] = "PUBLIC";
    typeASC[typeASC["PRIVATE"] = 2] = "PRIVATE";
    typeASC[typeASC["ORG_NEIGHBOUR_OR_COMUN_PERSON"] = 3] = "ORG_NEIGHBOUR_OR_COMUN_PERSON";
})(typeASC || (exports.typeASC = typeASC = {}));
//# sourceMappingURL=user.enum.js.map