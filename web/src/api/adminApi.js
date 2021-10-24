import axios from "axios";
import axiosClient from "./axiosClient";

const adminApi = {
    getUser: function () {
        return axiosClient.get("/admin/users");
    },
    updateUser: function (data) {
        return axiosClient.put("/admin/user?id=" + data);
    },
    getVehicle: function () {
        return axiosClient.get("/admin/vehicles");
    },
    updateVehicle: function (data) {
        return axiosClient.put("/admin/vehicle?id=" + data);
    },
    getTransaction: function () {
        return axiosClient.get("/admin/transactions");
    },
    getBrand: function () {
        return axiosClient.get('/admin/brands');
    },
    createBrand: function (data) {
        return axiosClient.post('/admin/brand', data);
    },
    getModel: function () {
        return axiosClient.get('/admin/models');
    },
    createModel: function (data) {
        return axiosClient.post('/admin/model', data);
    }
}
export default adminApi;