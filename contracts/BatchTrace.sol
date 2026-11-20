// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BatchTrace {
    struct Batch {
        string medicineName;
        string manufacturer;
        string status;
        string expiryDate;
        address owner;
        uint256 updatedAt;
        bool exists;
    }

    mapping(string => Batch) private batches;

    event BatchRegistered(string batchId, string medicineName, address indexed owner);
    event BatchUpdated(string batchId, string status, address indexed owner);

    constructor() {
        _register("SG-001", "Paracetamol 500mg", "Acme Pharma", "2027-06-30");
        _register("SG-002", "Amoxicillin 250mg", "MediSource", "2026-12-15");
    }

    function registerBatch(
        string calldata batchId,
        string calldata medicineName,
        string calldata manufacturer,
        string calldata expiryDate
    ) external {
        require(!batches[batchId].exists, "Batch already exists");
        batches[batchId] = Batch(
            medicineName,
            manufacturer,
            "Registered",
            expiryDate,
            msg.sender,
            block.timestamp,
            true
        );
        emit BatchRegistered(batchId, medicineName, msg.sender);
    }

    function updateStatus(string calldata batchId, string calldata status) external {
        Batch storage batch = batches[batchId];
        require(batch.exists, "Batch not found");
        require(batch.owner == msg.sender, "Only the batch owner can update it");
        batch.status = status;
        batch.updatedAt = block.timestamp;
        emit BatchUpdated(batchId, status, msg.sender);
    }

    function getBatchTrace(
        string calldata batchId
    )
        external
        view
        returns (
            string memory medicineName,
            string memory manufacturer,
            string memory status,
            string memory expiryDate,
            address owner,
            uint256 updatedAt
        )
    {
        Batch memory batch = batches[batchId];
        require(batch.exists, "Batch not found");
        return (
            batch.medicineName,
            batch.manufacturer,
            batch.status,
            batch.expiryDate,
            batch.owner,
            batch.updatedAt
        );
    }

    function _register(
        string memory batchId,
        string memory medicineName,
        string memory manufacturer,
        string memory expiryDate
    ) private {
        batches[batchId] = Batch(
            medicineName,
            manufacturer,
            "Registered",
            expiryDate,
            msg.sender,
            block.timestamp,
            true
        );
    }
}
