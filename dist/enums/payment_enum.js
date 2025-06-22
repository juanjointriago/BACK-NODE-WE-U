"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Taxes = exports.ARTICULES = exports.PaymentMethod = void 0;
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod[PaymentMethod["transfer"] = 1] = "transfer";
    PaymentMethod[PaymentMethod["creditCard"] = 2] = "creditCard";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
exports.ARTICULES = {
    asc: {
        price: 9.99,
        description: 'Cinco agentes de seguridad ciudadana',
        amount: 5,
    },
    subzone: {
        price: 9.99,
        description: 'Subzona',
        amount: 1,
    },
};
var Taxes;
(function (Taxes) {
    Taxes[Taxes["IVA"] = 0.15] = "IVA";
})(Taxes || (exports.Taxes = Taxes = {}));
//# sourceMappingURL=payment_enum.js.map