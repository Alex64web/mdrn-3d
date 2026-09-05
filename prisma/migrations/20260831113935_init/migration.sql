-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MakerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "printerName" TEXT NOT NULL,
    "bedSizeX" REAL NOT NULL,
    "bedSizeY" REAL NOT NULL,
    "bedSizeZ" REAL NOT NULL,
    "materials" TEXT NOT NULL,
    "colors" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" REAL NOT NULL DEFAULT 55.7887,
    "longitude" REAL NOT NULL DEFAULT 49.1221,
    "rating" REAL NOT NULL DEFAULT 5.0,
    CONSTRAINT "MakerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Model3D" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "royalty" REAL NOT NULL,
    "tags" TEXT NOT NULL,
    "sizeX" REAL NOT NULL,
    "sizeY" REAL NOT NULL,
    "sizeZ" REAL NOT NULL,
    "volume" REAL NOT NULL,
    "designerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Model3D_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "infill" INTEGER NOT NULL,
    "layerHeight" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "escrowStatus" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "makerId" TEXT,
    "weight" REAL,
    "qcPhoto" TEXT,
    "trackingNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model3D" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_makerId_fkey" FOREIGN KEY ("makerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "makerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_makerId_fkey" FOREIGN KEY ("makerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MakerProfile_userId_key" ON "MakerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");
