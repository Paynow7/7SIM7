import express from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const users = new Map(); // 测试阶段临时存储
const SECRET = process.env.JWT_SECRET;

// 注册接口
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    if (users.has(email)) {
        return res.status(400).json({ message: '该邮箱已注册' });
    }

    const hash = await bcrypt.hash(password, 10);
    users.set(email, { email, password: hash, verified: false });

    // 生成验证链接
    const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });
    const verifyLink = `${process.env.SERVER_URL}/api/verify?token=${token}`;

    // 发送邮件
    const transporter = nodemailer.createTransport({
        service: 'gmail', // 使用你的邮箱服务
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: '"7SIM 验证中心" <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: '验证您的邮箱 - 7SIM',
        html: `
            <h3>欢迎使用 7SIM</h3>
            <p>点击下方链接完成邮箱验证并自动登录：</p>
            <a href="${verifyLink}" target="_blank">${verifyLink}</a>
            <p>如果不是您本人操作，请忽略此邮件。</p>
        `
    });

    res.json({ message: '验证邮件已发送，请前往邮箱查看' });
});

// 验证接口
app.get('/api/verify', (req, res) => {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, SECRET);
        const user = users.get(decoded.email);
        if (!user) return res.status(404).send('用户不存在');
        user.verified = true;

        // 登录成功生成新 token
        const loginToken = jwt.sign({ email: user.email }, SECRET, { expiresIn: '7d' });

        // 跳回前端页面并带 token
        const frontend = process.env.FRONTEND_URL;
        res.redirect(`${frontend}?token=${loginToken}`);
    } catch (err) {
        res.status(400).send('链接无效或已过期');
    }
});

app.listen(3000, () => console.log('✅ Server running on port 3000'));
