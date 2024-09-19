import { Input } from '@mui/material';
import React from 'react'
import { cardsData } from '../../data/data';

const ShippingPayment = () => {
    return (
        <div className="payment-method">
            <h3 className="text-xxl payment-method-title">Payment Method</h3>
            <p className="text-base text-outerspace">
                All transactions are secure and encrypted.
            </p>
            <div className="list-group">
                <div className="list-group-item">
                    <div className="flex items-center list-group-item-head">
                        <Input
                            type="radio"
                            className="list-group-item-check"
                            name="payment_method"
                        />
                        <p className="font-semibold text-lg">
                            Credit Card
                            <span className="flex text-base font-medium text-gray">
                                We accept all major credit cards.
                            </span>
                        </p>
                    </div>
                    <div className="payment-cards flex flex-wrap">
                        {cardsData?.map((card) => {
                            return (
                                <div
                                    className="payment-card flex items-center justify-center"
                                    key={card.id}
                                >
                                    <Input type="radio" name="payment_cards" />
                                    <div className="card-wrapper bg-white w-full h-full flex items-center justify-center">
                                        <img src={card.imgSource} alt="" />
                                        <div className="card-selected text-sea-green">
                                            <i className="bi bi-check-circle-fill"></i>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="payment-details">
                        <div className="form-elem-group">
                            <Input
                                type="text"
                                className="form-elem"
                                placeholder="Card number"
                            />
                            <Input
                                type="text"
                                className="form-elem"
                                placeholder="Name of card"
                            />
                        </div>
                        <div className="form-elem-group">
                            <Input
                                type="text"
                                className="form-elem"
                                placeholder="Expiration date (MM/YY)"
                            />
                            <Input
                                type="text"
                                className="form-elem"
                                placeholder="Security Code"
                            />
                        </div>
                    </div>
                </div>

                <div className="horiz-line-separator"></div>
                <div className="list-group-item flex items-center">
                    <Input
                        type="radio"
                        className="list-group-item-check"
                        name="payment_method"
                    />
                    <p className="font-semibod text-lg">
                        Cash on delivery
                        <span className="flex text-base font-medium text-gray">
                            Pay with cash upon delivery.
                        </span>
                    </p>
                </div>
                <div className="horiz-line-separator"></div>
                <div className="list-group-item flex items-center">
                    <Input
                        type="radio"
                        className="list-group-item-check"
                        name="payment_method"
                    />
                    <p className="font-semibod text-lg">PayPal</p>
                </div>
            </div>
        </div>
    )
}

export default ShippingPayment