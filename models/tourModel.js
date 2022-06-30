const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour Must Always Have a Name'],
      unique: true,
      trim: true,
      minlength: [10, 'A Name must have minimum 10 Characters'],
      maxlength: [40, 'A name must have Maximum 40 Characters'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A Tour Must Always Have a Duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour Must Always Have a Group Size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour Must Always Have a Difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficluty should be under easy,medium and difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Minimum rating should be equal to or above 1.0'],
      max: [5, 'Maximum rating should be either 5 or Below'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A Tour Must Always have a Price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'The price discount should be below then the actual Price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A Tour Must Always have a Summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour Must Always have a Cover Image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point', //multiple geometries can be used
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.virtual('durationweeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -roles',
  });
  next();
});

tourSchema.pre('aggregate', function (next) {
  const things = this.pipeline()[0];
  if (Object.keys(things)[0] !== '$geoNear') {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  }
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });
// tourSchema.pre('save', function (next) {
//   console.log('will save the Document');
//   next();
// });
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

const Tour = new mongoose.model('Tour', tourSchema);
module.exports = Tour;
