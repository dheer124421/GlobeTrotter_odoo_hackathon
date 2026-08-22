import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Trip name is required'],
            trim: true,
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        description: {
            type: String,
            default: '',
        },
        coverPhoto: {
            type: String,
            default: '',
        },
        destinationCount: {
            type: Number,
            default: 0,
        },
        totalBudget: {
            type: Number,
            default: 0,
        },
        region: {
            type: String,
            enum: ['Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'None'],
            default: 'None',
        },
        itinerarySections: [
            {
                title: {
                    type: String,
                    default: 'New Section'
                },
                description: {
                    type: String,
                    default: ''
                },
                startDate: {
                    type: Date
                },
                endDate: {
                    type: Date
                },
                budget: {
                    type: Number,
                    default: 0
                },
                activities: [
                    {
                        name: {
                            type: String,
                            required: [true, 'Activity name is required']
                        },
                        category: {
                            type: String,
                            enum: ['Transport', 'Stay', 'Activities', 'Meals', 'Other'],
                            default: 'Activities'
                        },
                        time: {
                            type: String,
                            default: '12:00 PM'
                        },
                        cost: {
                            type: Number,
                            default: 0
                        },
                        dayNumber: {
                            type: Number,
                            default: 1
                        }
                    }
                ]
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
