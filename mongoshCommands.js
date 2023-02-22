/*
  // Used to aggregate aggregate URLs into one line;
  db.ORIGIN_ReviewPhotos.aggregate([
    {
      $group :
      {_id: "$review_id",
      photos: {$push: {id: "$id", url: "$url"}}}
    }, {$out: "reviewphotos"}], {allowDiskUse:true})

  // Used for aggregating review characteristics from a given unique review id
  db.reviewchars.aggregate([
  {
    $group:{
        _id: '$review_id',
        characteristics: { $push:  {
            characteristic_id: "$characteristic_id",
            value: "$value"
        }}
    }
  }, {$out:"ReviewChars"}
], {allowDiskUse:true})

  // Used to create the star rating aggregation needed for a product's review meta output
  db.reviews2gb.aggregate([
  {
    $group: {
      _id: "$product_id",
      "1": {$sum: {$cond: {"if": {"$eq": ["$rating", 1]},then: 1,else: 0}}},
      "2": {$sum: {$cond: {"if": {"$eq": ["$rating", 2]},then: 1,else: 0}}},
      "3": {$sum: {$cond: {"if": {"$eq": ["$rating", 3]},then: 1,else: 0}}},
      "4": {$sum: {$cond: {"if": {"$eq": ["$rating", 4]},then: 1,else: 0}}},
      "5": {$sum: {$cond: {"if": {"$eq": ["$rating", 5]},then: 1,else: 0}}},
      "reTrue": {$sum: {$cond: {"if": {"$eq": ["$recommend", "true"]}, then: 1, else:0}}},
      "reFalse": {$sum: {$cond: {"if": {"$eq": ["$recommend", "false"]}, then:1, else: 0}}},
    }
  },
  {
    $project: {
      product_id: "$_id",
      _id: 0,
      ratings: { "1": "$1", "2": "$2", "3": "$3", "4": "$4", "5": "$5"},
      recommend: { "false": "$reFalse", "true": "$reTrue"}
    }
  },
  {$sort: {product_id: 1}},
  {$out: 'ReviewMeta'}], {allowDiskUse: true})

//Used to convert the review's characteristic_id
//into key-value pair {<characteristic> : <value>}
db.ReviewChars.aggregate([
  {
    "$lookup": {
      "from": "chars",
      localField: "characteristics.characteristic_id",
      foreignField: "id",
      "as": "chars"
    }
  },
  {
    $addFields: {
      k: "$chars.name",
      v: "$characteristics.value"
    }
  },
  {
    $addFields: {
     field: {
        $map: {
          input: {$zip: { inputs: ["$k", "$v"]}},
          as: "el",
          in: {
            "k": {$arrayElemAt: ["$$el", 0]},
            "v": [{$arrayElemAt: ["$$el", 1]}]
          }
        }
      }
    }
  },
  {
    $project: {chars: { $arrayToObject: "$field"}}
  },
  {
    $out: {"reviewpairs"}
  }
], {allowDiskUse: true})

//Converts the _id into the review_id and the date into a string
db.changedreviews2gb.aggregate([
  { $project:
    {_id: 1, date: {$dateToString: { date :
        {$add : [new Date(0), "$date"]}, format:"%Y-%m-%dT%H:%M:%S.%LZ" }
    },
      product_id:1, rating:1, summary: 1, body:1,
      recommend:1, reported:1, reviewer_name: 1,
      reviewer_email:1, response: 1, helpfulness: 1}},
    {$sort: {_id: 1}},
    {$out: "changedreviews2gbdate"}], {allowDiskUse:true})

//Adds the photos to each review based on the review_id
//An index was created for the reviewphotos database on the review_id
//field to speed up the aggregation pipeline
db.reviewsDateReviewId.aggregate([
  {
    $lookup: {
      from: "reviewphotos",
      localField: "_id",
      foreignField: "review_id",
      as: "photos"
    }
  },
  {
    $project: {
      _id: 1, rating: 1, summary: 1,
      recommend: 1, response: 1, body: 1,
      date: 1, reviewer_name: 1, reviewer_email: 1,
      helpfulness:1, photos: 1
    }
  },
  {
    $project: { "photos.review_id": 0, }
  },
  {
    $out: "reviewsDateReviewIdPhotos"
  }
], {allowDiskUse: true})
//Building the review/meta database to closely reflect the FEC API
db.ReviewMeta.aggregate([
  {
    $lookup: {
      from: "revChars",
      localField: "_id",
      foreignField: "product_id",
      as: "chars"
    }
  },
  {
    $project: {
      _id: 1,
      ratings: 1,
      recommend: 1,
      chars: "$chars.characteristics"
    }
  }
])
//Combines the averages of feature values with the Reviews Meta
db.ReviewMeta2.aggregate([
  {
    $lookup: { from: "revChars", localField: "_id", foreignField: "product_id", as: "chars" }
  },
  {
    $project: { _id: 1, ratings: 1, recommend: 1, chars: "$chars.characteristics" }
  },
  {
    $addFields:
    { characteristics:
      { "Fit":
      { $cond: [{ $gt: [{ $avg: "$chars.Fit" }, null] },
      { $avg: "$chars.Fit" }, "$$REMOVE"] },
      "Quality":
      { $cond: [{ $gt: [{ $avg: "$chars.Quality" }, null] },
      { $avg: "$chars.Quality" }, "$$REMOVE"] },
      "Size":
      { $cond: [{ $gt: [{ $avg: "$chars.Size" }, null] },
      { $avg: "$chars.Size" }, "$$REMOVE"] },
      "Comfort":
      { $cond: [{ $gt: [{ $avg: "$chars.Comfort" }, null] },
      { $avg: "$chars.Comfort" }, "$$REMOVE"] },
      "Length":
      { $cond: [{ $gt: [{ $avg: "$chars.Length" }, null] },
      { $avg: "$chars.Length" }, "$$REMOVE"] },
      "Width": { $cond: [{ $gt: [{ $avg: "$chars.Width" }, null] },
      { $avg: "$chars.Width" }, "$$REMOVE"] }
    }}
  },
  {$project: { chars: 0 }},
  {$out: "reviewMetaFinal"}], {allowDiskUse: true})

//Very very unelegant solution to readd review ids into the Meta database
db.reviewMetaFinal.aggregate([
  {
    $lookup: {
      "from": "ORIGIN_chars",
      "localField": "_id",
      "foreignField": "product_id",
      "as": "chars"
    }
  },
  {
    $addFields: {
      characteristics: {
        Comfort: {
          $cond: [{$gt: ["$characteristics.Comfort", null]},
          {value: "$characteristics.Comfort",
          id: {$arrayElemAt: [{
            $map: {
              input: {
                $filter: {
                  input:"$chars",
                  as: "c",
                  cond: {$eq: ["$$c.name", "Comfort"]}
              }
            },
            as:"a",
            in: "$$a._id"
          }}, 0]
          }},

          "$$REMOVE"]},
        Fit: {
          $cond: [{$gt: ["$characteristics.Fit", null]},
          {value: "$characteristics.Fit",
          id: {$arrayElemAt: [{
            $map: {
              input: {
                $filter: {
                  input:"$chars",
                  as: "c",
                  cond: {$eq: ["$$c.name", "Fit"]}
              }
            },
            as:"a",
            in: "$$a._id"
          }}, 0]
          }},"$$REMOVE"]},
        Length: {
          $cond: [{$gt: ["$characteristics.Length", null]},
          {value: "$characteristics.Length",
          id: {$arrayElemAt: [{
            $map: {
              input: {
                $filter: {
                  input:"$chars",
                  as: "c",
                  cond: {$eq: ["$$c.name", "Length"]}
              }
            },
            as:"a",
            in: "$$a._id"
          }}, 0]
          }},"$$REMOVE"]},
        Quality: {
          $cond: [{$gt: ["$characteristics.Quality", null]},
          {value: "$characteristics.Quality",
          id: {$arrayElemAt: [{
            $map: {
              input: {
                $filter: {
                  input:"$chars",
                  as: "c",
                  cond: {$eq: ["$$c.name", "Quality"]}
              }
            },
            as:"a",
            in: "$$a._id"
          }}, 0]
          }},"$$REMOVE"]},
        Size: {
          $cond: [{$gt: ["$characteristics.Size", null]},
          {value: "$characteristics.Size",
          id: {$arrayElemAt: [{
            $map: {
              input: {
                $filter: {
                  input:"$chars",
                  as: "c",
                  cond: {$eq: ["$$c.name", "Size"]}
              }
            },
            as:"a",
            in: "$$a._id"
          }}, 0]
          }},"$$REMOVE"]},
        Width: {
          $cond: [{$gt: ["$characteristics.Width", null]},
          {value: "$characteristics.Width",
          id: {$arrayElemAt: [{
            $map: {
              input: {
                $filter: {
                  input:"$chars",
                  as: "c",
                  cond: {$eq: ["$$c.name", "Width"]}
              }
            },
            as:"a",
            in: "$$a._id"
          }}, 0]
          }},"$$REMOVE"]},
      }
    }
  },
  {
    $project: {
      _id:1, characteristics:1, ratings:1, recommend:1
    }
  }
])
*/
